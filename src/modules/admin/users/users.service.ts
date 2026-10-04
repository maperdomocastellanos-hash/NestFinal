import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(User) private readonly userRepository: Repository<User>,
  @InjectRepository(Role) private readonly roleRepository: Repository<Role>
  )
  {}


  async create(CrearUsuario: CreateUserDto) {
    const{name, email, password, roleId} = CrearUsuario;

    const existeCorreo = await this.userRepository.findOneBy({email})
    if(existeCorreo){
        throw new BadRequestException(`El correo ${email} ya existe`)
    }

    // Asignar roles al usuario
    let roles: Role[] = [];
    if(roleId?.length){                          //Si existe rol y al menos tiene un elemento
      roles = await this.roleRepository.find({where: {id: In(roleId)}});  
    }

  //validamos
    if(roles.length !== roleId?.length){       //roles.length → cuántos roles hay en la base de datos
            throw new BadRequestException('Uno ó mas rolesID no son validos')
    };
       // roleid = [1, 2, 999]; // el usuario pide estos 3 roles
      // Pero en tu tabla roles solo existen los IDs 1 y 2. El 999 no existe.

      
    const passwordEncriptada = await bcrypt.hash(password,12)

    const crearUsuario = this.userRepository.create
    ({
      name, 
      email, 
      password: passwordEncriptada,
      roles
    });

    return this.userRepository.save(crearUsuario);
    
  }


  async listarUsuario() {
     try {
        return await this.userRepository.find();
     } catch (error) {
        throw new InternalServerErrorException('Error al listar usuario')
     } 
  }


   async mostrarUnUsuario(Id:string){
      try{
    const usuario = await this.userRepository.findOneBy({id : Id})
     if (!usuario) throw new NotFoundException(`Usuario con id ${Id} no encontrado`);
     return usuario;
     }catch(error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar el usuario');
    }}

    
    async actualizarUsuario(Id: string, DatosModificados: UpdateUserDto){
        const usuario = await this.mostrarUnUsuario(Id)
        if(!usuario){
        throw new NotFoundException('Usuario no encontrado')
        }
        const usuarioActualizado = this.userRepository.merge(usuario, DatosModificados);
        return this.userRepository.save(usuarioActualizado);

    }


    
//Creamos una funcion "mostrar" para usar PROPIAMENTE en la autenticacion::
async ExtraerDatosPorEmail(correo: string) {   //parametro
try{
  const usuario = await this.userRepository.findOneBy({email: correo});
     if (!usuario) throw new NotFoundException(`usuario con id ${correo} no encontrado`);  //si no hay nada --> Publicacion con id ${id} no encontrada
     return usuario;
} catch(error){
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException(`usuario con id ${correo} no encontrado`);  
}}
//Termina

}
