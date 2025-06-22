import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Documento from "../Models/Documento";
import type { Request, Response, NextFunction } from "express";

// Solución para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

export const uploadDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // El archivo subido estará en req.file
    const file = req.file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ mensaje: "No se subió ningún archivo" });
      return next();
    }

    // Guardar información en MongoDB
    const nuevoDocumento = new Documento({
      nombre_original: file.originalname,
      nombre_archivo: file.filename,
      ruta: file.path,
      tamano: file.size,
      tipo_archivo: file.mimetype,
      fecha_subida: new Date(),
      // usuario_id: req.body.usuario_id // Si se requiere asociar a un usuario
    });
    await nuevoDocumento.save();

    res.status(201).json({ mensaje: "Archivo subido correctamente", documento: nuevoDocumento });
    return next();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al subir el archivo", error });
    return next(error);
  }
};
