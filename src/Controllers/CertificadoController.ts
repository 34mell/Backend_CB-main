import type { NextFunction, Request, Response } from "express";
import Certificado from "../Models/Certificado";

export const uploadCertificado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // El archivo subido estará en req.file
    const file = req.file;
    if (!file) {
      res.status(400).json({ mensaje: "No se subió ningún archivo" });
      return next();
    }

    // Guardar información en MongoDB
    const nuevoCertificado = new Certificado({
      nombre_original: file.originalname,
      nombre_archivo: file.filename,
      ruta: file.path,
      tamano: file.size,
      tipo_archivo: file.mimetype,
      fecha_subida: new Date(),
      // usuario_id: req.body.usuario_id // Si se requiere asociar a un usuario
    });
    await nuevoCertificado.save();

    res.status(201).json({
      mensaje: "Archivo subido correctamente",
      certificado: nuevoCertificado,
    });
    return next();
  } catch (error) {
    res.status(500).json({ mensaje: "Error al subir el archivo", error });
    return next(error);
  }
};
