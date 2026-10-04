import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Permission } from '../permission/entities/permission.entity';


@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    private readonly datasource: DataSource)
  {}


async create(createRoleDto: CreateRoleDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

///////////////////////////////////////////////////////////////////////////////////////////////////////

    try {
      const roleRepo = queryRunner.manager.getRepository(Role);
      const permissionRepo = queryRunner.manager.getRepository(Permission);

      const {permissionIds, ...RestoData} = createRoleDto;
      const verificarRol = await roleRepo.findOneBy({name: RestoData.name});
      if(verificarRol){
        throw new ConflictException(`El rol ${RestoData.name} ya existe`)
      }

      const permisosValidados: Permission[] = [];

      if (permissionIds?.length) {
      for (const pId of permissionIds) {  //Un loop que recorre el arreglo permissionIds uno por uno => permissionIds = [1, 2, 3]

          const verificarPermiso = await permissionRepo.findOneBy({ id: pId });
          if (!verificarPermiso) throw new NotFoundException(`Permiso con id ${pId} no encontrado`);
          permisosValidados.push(verificarPermiso);
      }}

      const role = roleRepo.create({...RestoData, permission:permisosValidados})
      const roleGuardado = await roleRepo.save(role);
      await queryRunner.commitTransaction();
      return roleGuardado;
    } catch (error) {await queryRunner.rollbackTransaction();
        console.error('Error en create (roles):', error);
        if (error instanceof HttpException) throw error;
        throw new HttpException('Error al crear el rol con sus permisos', HttpStatus.INTERNAL_SERVER_ERROR,);
    } finally {
        await queryRunner.release();
    }

  }

///////////////////////////////////////////////////////////////////////////////////////////////////////

  findAll() {
        return this.roleRepository.find();
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////

 async findOne(id: number) {
        const role = await this.roleRepository.findOneBy({id: id});
        if (!role) {
            throw new NotFoundException(`Rol con id ${id} no encontrado`);
        }
        return role;
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////  

 async update(id: number, updateRoleDto: UpdateRoleDto) {

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const roleRepo = queryRunner.manager.getRepository(Role);
        const permissionRepo = queryRunner.manager.getRepository(Permission);

        const { permissionIds, ...roleData } = updateRoleDto;

        // Validar que el rol exista:
        const role = await roleRepo.findOneBy({ id });
        if (!role) throw new NotFoundException(`Rol con id ${id} no encontrado`);

        // Preparar el array donde vas a ir guardando los permisos validados:
        const permisosValidados: Permission[] = [];

        // El loop de permisos:
        if (permissionIds) {
            for (const perm of permissionIds) {
                const existePermiso = await permissionRepo.findOneBy({ id: perm });
                if (!existePermiso) throw new NotFoundException(`Permiso con id ${perm} no encontrado`);
                permisosValidados.push(existePermiso);
            }
        }

        Object.assign(role, roleData, 
            { permission: permisosValidados.length ? permisosValidados : role.permission });
        // role => destino: el rol que ya sacaste de la base de datos
        // permisosValidados.length ? permisosValidados : role.permission
        // condición =>Si permisosValidados.length es mayor a 0  ?  usa permisosValidados (los permisos nuevos) : usa role.permission (los permisos que el rol ya tenía antes, sin tocarlos).

        const roleActualizado = await roleRepo.save(role);
        await queryRunner.commitTransaction();
        return roleActualizado;

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error en update (roles):', error);
        if (error instanceof HttpException) throw error;
        throw new HttpException(
            'Error al actualizar el rol con sus permisos',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    } finally {
        await queryRunner.release();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
   async remove(id: number) {
        const role = await this.findOne(id);
        await this.roleRepository.remove(role);
        return { message: `Rol ${id} eliminado` };
    }


///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    private async findPermissionsByIds(ids: number[]) {
        const permissions = await this.permissionRepository.findBy({ id: In(ids) });

        if (permissions.length !== ids.length) {
            const idsEncontrados = permissions.map(p => p.id);
            //El .map(p => p.id) recorre cada objeto (p) y
            // se queda solo con su propiedad id, descartando el resto

            const missing = ids.filter(id => !idsEncontrados.includes(id));
            //Compara el array original ([1, 3, 5]) contra los que sí encontró ([1, 3]), y se 
            // queda solo con los que no están ahí. Resultado: missing = [5].

            throw new NotFoundException(`Permisos no encontrados: ${missing.join(', ')}`);
        }

        return permissions;
    }

}
