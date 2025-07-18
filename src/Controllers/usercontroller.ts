import type Usuario from "../Models/Usuario";
import { UsuariosRepository } from "../Repositorio/UsuariosRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const usuariosRepository = new UsuariosRepository();

export const register = async (req: any, res: any) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    console.log('Received registration request:', { nombre, apellido, email, password: '***' });

    // Validate required fields
    if (!nombre || !apellido || !email || !password) {
      console.log('Missing required fields:', { 
        nombre: !nombre, 
        apellido: !apellido, 
        email: !email, 
        password: !password 
      });
      return res.status(400).json({ 
        message: "All fields are required",
        missing: {
          nombre: !nombre,
          apellido: !apellido,
          email: !email,
          password: !password
        }
      });
    }
    

    // Check if user already exists in DB
    const existingUsers = await usuariosRepository.getUsuarios();
    if (existingUsers.find((user: Usuario) => user.email === email)) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully'); 
    const newUser = await usuariosRepository.createUsuario({
      id: 0, // DB will auto-generate
      nombre,
      apellido,
      email,
      contraseña: hashedPassword
    });
    console.log('User created successfully:', { id: newUser.id, email: newUser.email });    // Create and return JWT token - incluir el rol en el token
    const token = jwt.sign({ 
      id: newUser.id
    }, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        firstName: newUser.nombre,
        lastName: newUser.apellido,
        email: newUser.email
      },
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Find user in DB
    const users = await usuariosRepository.getUsuarios();
    const user = users.find((u: Usuario) => u.email === email);
   
    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ 
      id: user.id,
      rol: user.rol || 'user'
    }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.nombre,
        lastName: user.apellido,
        email: user.email,
        rol: user.rol || 'user',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifySession = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // Obtener los datos del usuario desde la base de datos
    const users = await usuariosRepository.getUsuarios();
    const user = users.find((u: Usuario) => u.id.toString() === userId.toString());
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Crear un nuevo token
    const token = jwt.sign({ 
      id: user.id,
      rol: user.rol || 'user'
    }, JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.nombre,
        lastName: user.apellido,
        email: user.email,
        rol: user.rol || 'user',
      },
    });
  } catch (error) {
    console.error('Error in session verification:', error);
    res.status(500).json({ message: "Server error" });
  }
};
