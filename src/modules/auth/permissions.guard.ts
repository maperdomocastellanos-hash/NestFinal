
// mismo caso que el decorador. Este archivo es infraestructura, no lógica de negocio, 
// así que una vez que funciona, lo escribes una sola vez y no lo vuelves a tocar al agregar 
// módulos nuevos (categorías, productos, órdenes, lo que sea).


import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/admin/users/entities/user.entity';
import { PERMISSIONS_KEY, RequiredPermission } from './require-permissions.decorator';


@Injectable()
export class PermissionsGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Revisa qué permisos requiere este endpoint (via el decorador @RequirePermissions):
        const permisosRequeridos = this.reflector.getAllAndOverride<RequiredPermission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Si el endpoint no tiene @RequirePermissions, no se restringe nada:
        if (!permisosRequeridos || permisosRequeridos.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const payload = request.user; // esto lo dejó el AuthGuard (request['user'] = payload)

        if (!payload) {
            throw new ForbiddenException('No se pudo identificar al usuario');
        }

        // Buscamos el usuario completo con sus roles y permisos:
        const usuario = await this.userRepository.findOne({
            where: { id: payload.sub }, // ajusta "sub" según cómo llames el id en tu payload
            relations: { roles: true },      // los "permission" ya vienen eager:true desde Role
        });

        if (!usuario || !usuario.roles) {
            throw new ForbiddenException('No tienes roles asignados');
        }

        // Aplanamos todos los permisos de todos los roles del usuario:
        const permisosDelUsuario: RequiredPermission[] = usuario.roles.flatMap(
            (role: any) => role.permission?.map((p: any) => ({ action: p.actions, subject: p.subject })) ?? []
        );

        // Verificamos que tenga TODOS los permisos requeridos:
        const tienePermiso = permisosRequeridos.every(requerido =>
            permisosDelUsuario.some(
                p => p.action === requerido.action && p.subject === requerido.subject
            )
        );

        if (!tienePermiso) {
            throw new ForbiddenException(
                `No tienes permiso para: ${permisosRequeridos.map(p => `${p.action} ${p.subject}`).join(', ')}`
            );
        }

        return true;
    }
}


