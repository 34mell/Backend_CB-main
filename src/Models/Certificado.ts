import mongoose, { Document, Schema } from "mongoose";

export interface ICertificate extends Document {
  userId: string;
  fileName: string;
  encryptionSalt: string;
  encryptionIV: string;
  certificateData: string;
  type?: string;
  createdAt: Date;
}

const certificateSchema: Schema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  encryptionSalt: { type: String, required: true },
  encryptionIV: { type: String, required: true },
  certificateData: { type: String, required: true },
  type: { type: String, default: "p12" },
  createdAt: { type: Date, default: Date.now },
});

const Certificado = mongoose.model<ICertificate>(
  "Certificate",
  certificateSchema,
  "certificates"
);

export default Certificado;
