import { Router } from "express";
import { login, register } from "../Controllers/usercontroller";
import { upload, uploadDocumento } from '../Controllers/Documentoscontroller';


const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post('/documentos/upload', upload.single('archivo'), uploadDocumento);


export default router;
