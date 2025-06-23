import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./Rutas/rutas";
import dotenv from "dotenv";
import morgan from "morgan";

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(morgan("dev"));
const Puerto = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Conexión a MongoDB
await mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Documentos", {
    authSource: "admin",
    user: process.env.MONGODB_USER || "root",
    pass: process.env.MONGODB_PASS || "admin",
    dbName: process.env.MONGODB_DB || "Documentos",
  })
  .then(() => console.log("Conectado a MongoDB (Documentos)"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

app.use(cors());
app.use(express.json());

app.use("/api/", router);

app.listen(Puerto, () => {
  console.log("Servidor corriendo en el puerto 3000 ");
});
