import { Router } from "express";
import { login, register } from "../Controllers/usercontroller";
import { uploadDocumento, getDocumentosByUsuario} from '../Controllers/Documentoscontroller';
import { uploadDoc } from '../Almacenamiento/DocumentosStorage';
import { auth } from '../Middleware/authMiddleware';
const router = Router();

// Rutas públicas
router.post("/login", login);
router.post("/register", register);

// Rutas protegidas - Documentos
router.post('/documentos/upload', auth, uploadDoc.single('archivo'), uploadDocumento);
router.get('/documentos/usuario', auth, getDocumentosByUsuario);


export default router;
