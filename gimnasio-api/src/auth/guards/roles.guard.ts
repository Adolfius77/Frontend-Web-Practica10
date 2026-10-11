import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PayloadJwt } from "../dominio/usuario";

@Injectable()
export class rolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(contexto: ExecutionContext): boolean {
        const esPublico = this.reflector.getAllAndOverride<boolean>('esPublico', [
            contexto.getHandler(),
            contexto.getClass(),
        ])
        if (esPublico) {
            return true;
        }

        const permitidos = this.reflector.getAllAndOverride<string[]>('roles', [
            contexto.getHandler(),
            contexto.getClass(),
        ]);
        if (!permitidos || permitidos.length === 0) {
            return true;
        }

        const req = contexto.switchToHttp().getRequest<{ user?: PayloadJwt }>();
        const rol = req.user?.rol;
        if(rol && permitidos.includes(rol)) {
            return true;
        }
        throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }
}