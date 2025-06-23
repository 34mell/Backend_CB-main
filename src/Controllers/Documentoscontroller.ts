import Documento from "../Models/Documento";
import type { Request, Response, NextFunction } from "express";

export const uploadDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // El archivo subido estará en req.file
    const file = req.file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ mensaje: "No se subió ningún archivo" });
      return next();
    }

    // Verificar que existe usuario autenticado
    if (!req.user || !req.user.id) {
      console.log("Error: Usuario no autenticado o sin ID", req.user);
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return next();
    }

    console.log("Usuario autenticado:", req.user);
    const userId = req.user.id.toString();
    console.log("ID de usuario que sube el documento:", userId);

    // Guardar información en MongoDB
    const nuevoDocumento = new Documento({
      nombre_original: file.originalname,
      nombre_archivo: file.filename,
      ruta: file.path,
      tamano: file.size,
      tipo_archivo: file.mimetype,
      fecha_subida: new Date(),
      usuario_id: userId
    });
    
    console.log("Guardando documento con datos:", {
      nombre_original: file.originalname,
      nombre_archivo: file.filename,
      usuario_id: userId
    });
    
    const documentoGuardado = await nuevoDocumento.save();
    console.log("Documento guardado correctamente:", documentoGuardado);

    res.status(201).json({ 
      mensaje: "Archivo subido correctamente", 
      documento: {
        ...documentoGuardado.toObject(),
        usuario_id: userId
      }
    });
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    res.status(500).json({ mensaje: "Error al subir el archivo", error });
    return next(error);
  }
};

// Función para obtener documentos por usuario
export const getDocumentosByUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar que existe usuario autenticado
    if (!req.user || !req.user.id) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return next();
    }

    const usuarioId = req.user.id.toString();
    console.log("Buscando documentos para el usuario ID:", usuarioId);
    
    // Buscar documentos asociados al usuario
    const documentos = await Documento.find({ usuario_id: usuarioId });
    
    console.log(`Se encontraron ${documentos.length} documentos para el usuario`);
    
    res.status(200).json({ 
      mensaje: "Documentos recuperados correctamente", 
      documentos,
      total: documentos.length,
      usuario_id: usuarioId 
    });
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ mensaje: "Error al obtener documentos", error });
    return next(error);
  }
};
