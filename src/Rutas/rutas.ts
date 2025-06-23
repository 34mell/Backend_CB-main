import { Router } from "express";
import { login, register, verifySession } from "../Controllers/usercontroller";
import { uploadDocumento, getDocumentosByUsuario } from '../Controllers/Documentoscontroller';
import { uploadCertificado, getCertificado} from '../Controllers/CertificadoController';
import { uploadDoc } from '../Almacenamiento/DocumentosStorage';
import { uploadCert } from '../Almacenamiento/CertificadoStorage';
import { auth } from '../Middleware/authMiddleware';
const router = Router();

// Rutas públicas
router.post("/login", login);
router.post("/register", register);

// Rutas protegidas - Documentos
router.post('/documentos/upload', auth, uploadDoc.single('archivo'), uploadDocumento);
router.get('/documentos/usuario', auth, getDocumentosByUsuario);

// Rutas protegidas - Certificados
router.post('/certificados/upload', auth, uploadCert.single('certificado'), (req, res, next) => {
	Promise.resolve(uploadCertificado(req, res, next)).catch(next);
});
router.get('/certificados/usuario', auth, (req, res, next) => {
	Promise.resolve(getCertificado(req, res, next)).catch(next);
});

router.get('/auth/session', auth, verifySession);

export default router;
