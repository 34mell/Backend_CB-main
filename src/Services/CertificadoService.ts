import crypto from "crypto";
import fs from "fs";
import Certificado from "../Models/Certificado";
import mongoose from "mongoose";

export class CertificadoService {
  /**
   * Deriva una clave a partir de una contraseña y un salt
   */
  static deriveKey(password: string, salt: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, "sha256", (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      });
    });
  }

  /**
   * Encripta y almacena un certificado P12
   */
  static async encryptAndStoreCertificate(
    filePath: string,
    password: string,
    userId: string
  ): Promise<string> {
    // Validaciones básicas
    if (!fs.existsSync(filePath)) throw new Error("El archivo .p12 no existe");
    if (!password) throw new Error("La contraseña es requerida");
    if (!userId) throw new Error("ID de usuario inválido");

    // Verificar si el usuario ya tiene un certificado
    const existingCertificate = await Certificado.findOne({ userId });
    if (existingCertificate) throw new Error("El usuario ya tiene un certificado registrado");

    // Leer archivo del certificado
    const fileContent = fs.readFileSync(filePath);

    // Generar salt y iv para la encriptación
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);

    // Derivar clave de la contraseña utilizando PBKDF2
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");

    // Crear cipher con AES-256-CBC
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    // Encriptar el contenido del certificado
    let encryptedData = cipher.update(fileContent);
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);

    // Guardar en MongoDB
    const certificate = new Certificado({
      userId: userId,
      fileName: filePath.split('/').pop() || filePath.split('\\').pop(),
      encryptionSalt: salt.toString("hex"),
      encryptionIV: iv.toString("hex"),
      certificateData: encryptedData,
      type: "p12",
    });

    const savedCertificate = await certificate.save() as mongoose.Document & {
      _id: mongoose.Types.ObjectId;
    };
    
    // Eliminar el archivo P12 original
    fs.unlinkSync(filePath);
    
    console.log('Archivo .p12 cifrado y almacenado con éxito');
    return savedCertificate._id.toString();
  }

  /**
   * Desencripta y recupera un certificado
   */
  static async decryptAndRetrieveCertificate(certificateId: string, password: string, outputPath: string): Promise<void> {
    // Buscar el certificado
    const certificate = await Certificado.findById(certificateId);
    if (!certificate) throw new Error('Certificado no encontrado');

    // Derivar la clave
    const derivedKey = await this.deriveKey(password, certificate.encryptionSalt);
    const iv = Buffer.from(certificate.encryptionIV, 'hex');

    // Desencriptar
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(certificate.certificateData),
      decipher.final()
    ]);

    // Guardar el archivo desencriptado
    fs.writeFileSync(outputPath, decrypted);
    console.log('Archivo .p12 recuperado y descifrado con éxito');
  }
  
  /**
   * Obtiene certificado por ID de usuario
   */
  static async getCertificateByUserId(userId: string) {
    if (!userId) throw new Error("ID de usuario inválido");
  
    try {
      const certificate = await Certificado.findOne({ userId });
      if (!certificate) return null;
      
      return {
        id: certificate._id,
        fileName: certificate.fileName,
        createdAt: certificate.createdAt,
        userId: certificate.userId
      };
    } catch (error) {
      console.error("Error al buscar el certificado:", error);
      throw new Error(`Error al buscar el certificado: ${(error as Error).message}`);
    }
  }

  static async decryptCertificate(certificateId: string, password: string): Promise<Buffer> {
    // Buscar el certificado
    const certificate = await Certificado.findById(certificateId);
    if (!certificate) throw new Error('Certificado no encontrado');

    // Derivar la clave
    const derivedKey = await this.deriveKey(password, certificate.encryptionSalt);
    const iv = Buffer.from(certificate.encryptionIV, 'hex');

    // Desencriptar
    const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(certificate.certificateData),
      decipher.final()
    ]);

    return decrypted;
  }
}