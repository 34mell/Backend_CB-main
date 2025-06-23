interface Usuario {
  nombre: string;
  apellido: string;
  id: number;
  email: string;
  contraseña: string;
  rol?: 'user' | 'admin';
}
export type { Usuario as default };
