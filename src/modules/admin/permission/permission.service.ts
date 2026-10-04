import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionService {

  constructor(
    @InjectRepository(Permission) private readonly permisoRepository: Repository<Permission>)
  {}

  async create(createPermissionDto: CreatePermissionDto) {
     const existePermiso = await this.permisoRepository.findOne({
      where: 
      {
        actions: createPermissionDto.actions,
        subject: createPermissionDto.subject
      }
     });

     if (existePermiso) {
     throw new ConflictException(
     `Ya existe un permiso con la acción '${createPermissionDto.actions}' sobre '${createPermissionDto.subject}'`
     )}
      const permission = this.permisoRepository.create(createPermissionDto);
      return this.permisoRepository.save(permission);
  }

   findAll() {
        return this.permisoRepository.find();
    }

    async findOne(id: number) {
        const permission = await this.permisoRepository.findOneBy({id: id});
        if (!permission) {
            throw new NotFoundException(`Permiso con id ${id} no encontrado`);
        }
        return permission;
    }

    async update(id: number, updatePermissionDto: UpdatePermissionDto) {
        const permission = await this.findOne(id);
        Object.assign(permission, updatePermissionDto);
        return this.permisoRepository.save(permission);
    }

    async remove(id: number) {
        const permission = await this.findOne(id);
        await this.permisoRepository.remove(permission);
        return { message: `Permiso ${id} eliminado` };
    }


}
