import { Router } from "express";
import { login, register } from "../Controllers/usercontroller";
import { uploadDocumento } from '../Controllers/Documentoscontroller';
import { uploadDoc } from '../Almacenamiento/DocumentosStorage';
import { auth } from '../Middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.post("/login", login);
router.post("/register", register);

// Rutas protegidas
router.post('/documentos/upload', auth, uploadDoc.single('archivo'), uploadDocumento);


export default router;
