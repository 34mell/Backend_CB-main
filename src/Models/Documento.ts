import { Schema, model, Document } from 'mongoose';

export interface IDocumento extends Document {
  nombre_original: string;
  nombre_archivo: string;
  ruta: string;
  tamano: number;
  tipo_archivo: string;
  fecha_subida: Date;
  usuario_id?: string;
}

const DocumentoSchema = new Schema<IDocumento>({
  nombre_original: { type: String, required: true },
  nombre_archivo: { type: String, required: true },
  ruta: { type: String, required: true },
  tamano: { type: Number, required: true },
  tipo_archivo: { type: String, required: true },
  fecha_subida: { type: Date, default: Date.now },
  usuario_id: { type: String, required: true },
});

export default model<IDocumento>('Doc', DocumentoSchema, 'Doc');
