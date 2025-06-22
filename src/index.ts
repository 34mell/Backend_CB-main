import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./Rutas/rutas";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const app = express();
const Puerto = 3000;

// Conexión a MongoDB



await mongoose.connect("mongodb://localhost:27017/Documentos", {
    authSource: "admin",
    user: "root",
    pass: "admin",
    dbName: "Documentos",// Tiempo de espera para la conexión del socket
})
  .then(() => console.log("Conectado a MongoDB (Documentos)"))
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

app.use(cors());
app.use(express.json());

app.use("/api/", router);

app.listen(Puerto, () => {
  console.log("Servidor corriendo en el puerto 3000 ");
});
