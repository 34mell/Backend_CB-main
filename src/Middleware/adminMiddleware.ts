import type { Request, Response, NextFunction } from 'express';
import { UsuariosRepository } from '../Repositorio/UsuariosRepository';

const usuariosRepository = new UsuariosRepository();

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar que existe usuario autenticado
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Verificar si el usuario tiene rol de administrador desde el token JWT
    if (req.user.rol !== 'admin') {
      res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
