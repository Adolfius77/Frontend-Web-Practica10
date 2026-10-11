// NUEVO (Tarea): decorador de roles. Igual que @Publico(), no es magia,
// SetMetadata pega la lista de roles al metodo y el RolesGuard la lee
// con el Reflector.
import { SetMetadata } from '@nestjs/common';
import { Rol } from '../dominio/usuario';

export const ROLES = 'roles'; // la llave del dato

// Uso: @Roles(Rol.entrenador, Rol.admin) encima de un metodo o controller.
// ...roles junta todos los argumentos en un arreglo.
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES, roles);
