import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import { CertificadoService } from "../Services/CertificadoService";
import path from "path";


export const uploadCertificado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    const { password } = req.body;
    
    if (!file) {
      return res.status(400).json({ mensaje: "No se subió ningún archivo" });
    }

    // Verificar que existe usuario autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    // Log para depuración
    console.log("Usuario autenticado:", req.user);
    console.log("ID de usuario:", req.user.id, "Tipo:", typeof req.user.id);

    // Verificar que el archivo sea de tipo p12
    if (path.extname(file.originalname).toLowerCase() !== ".p12") {
      fs.unlinkSync(file.path);
      return res.status(400).json({ mensaje: "El archivo debe ser de tipo .p12" });
    }

    // Asegurar que el ID de usuario sea una cadena
    const userId = req.user.id.toString();
    console.log("ID de usuario (después de toString):", userId);
    
    // Verificar si el usuario ya tiene un certificado
    try {
      const existingCert = await CertificadoService.getCertificateByUserId(userId);
      if (existingCert) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ mensaje: "El usuario ya tiene un certificado registrado" });
      }
    } catch (certError) {
      console.error("Error al verificar certificado existente:", certError);
      fs.unlinkSync(file.path);
      return res.status(500).json({ 
        mensaje: "Error al verificar certificados existentes", 
        error: (certError as Error).message 
      });
    }

    if (!password) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ mensaje: "Se requiere una contraseña para el certificado" });
    }

    // Encriptar y guardar en la base de datos
    const certificateId = await CertificadoService.encryptAndStoreCertificate(
      file.path,
      password,
      userId
    );

    res.status(201).json({
      mensaje: "Certificado cargado y encriptado correctamente",
      certificateId,
      certificado: {
        id: certificateId,
        nombre: file.originalname,
        fechaSubida: new Date(),
        emisor: "Sistema de Firma Digital", 
      }
    });
  } catch (error) {
    console.error("Error al subir certificado:", error);

    // Asegurar que el archivo temporal se elimina en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      mensaje: "Error al procesar el certificado",
      error: (error as Error).message,
    });
  }
};

export const getCertificado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verificar que existe usuario autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const userId = req.user.id.toString();
    console.log("Buscando certificado para el usuario ID:", userId);
    
    // Buscar certificado del usuario
    const certificado = await CertificadoService.getCertificateByUserId(userId);

    if (!certificado) {
      return res
        .status(404)
        .json({ 
          mensaje: "No se encontró un certificado para este usuario",
          certificados: []
        });
    }

    res.status(200).json({
      mensaje: "Certificado encontrado",
      certificados: [{
        id: certificado.id,
        nombre: certificado.fileName,
        fechaSubida: certificado.createdAt,
        emisor: "Sistema de Firma Digital", 
        userId: certificado.userId
      }]
    });
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    res
      .status(500)
      .json({
        mensaje: "Error al obtener el certificado",
        error: (error as Error).message,
        certificados: []
      });
  }
};
