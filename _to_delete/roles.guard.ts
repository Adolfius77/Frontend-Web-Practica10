// NUEVO (Tarea): el segundo guardia. Corre DESPUES del JwtAuthGuard, asi
// que cuando llega aqui ya se sabe quien es el usuario (req.user).
// JwtAuthGuard contesta "quien eres?"   -> si no hay token valido, 401.
// RolesGuard   contesta "que puedes?"   -> si tu rol no alcanza,    403.
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../decoradores/roles.decorator';
import { ES_PUBLICO } from '../decoradores/publico.decorator';
import { PayloadJwt, Rol } from '../dominio/usuario';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    // Lo publico no se revisa: ni siquiera hay usuario.
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (esPublico) return true;

    // Que roles pide la ruta? Primero el metodo, luego la clase.
    const permitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    // Sin @Roles(): basta con tener sesion (eso ya lo reviso el JwtAuthGuard).
    if (!permitidos || permitidos.length === 0) return true;

    // El rol sale del TOKEN (lo dejo ahi la JwtStrategy), no del cuerpo.
    const req = contexto.switchToHttp().getRequest<{ user?: PayloadJwt }>();
    const rol = req.user?.rol;
    if (rol && permitidos.includes(rol)) return true;

    // Se quien eres, pero tu rol no puede: 403 (no 401).
    throw new ForbiddenException(
      `Solo ${permitidos.join(' o ')} pueden hacer esto`,
    );
  }
}
