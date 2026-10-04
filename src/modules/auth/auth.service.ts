import { HttpException, Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../admin/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly userservice: UsersService, 
    private readonly jwtservice: JwtService)
    {}

  ////////////////////////////////////////////////////////////////////////////////////////////////////////  
  async funLogin(correoIngresado: string, pwLogin:string) {
    const datosDelUsuario = await this.userservice.ExtraerDatosPorEmail(correoIngresado)
    if(!datosDelUsuario){throw new HttpException('Usuario no existe', 404)};

     const verificarContrasenia = await compare(pwLogin, datosDelUsuario.password);
     if(!verificarContrasenia){throw new HttpException('Contraseña incorrecta', 401)}

     const payload = 
     {
          sub: datosDelUsuario.id, 
          email: datosDelUsuario.email 
     }
     const access_token= await this.jwtservice.signAsync(payload);
      return { access_token };
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////

  async funGetPerfil(correoIngresado){
    const {password,...restoDatos} = await this.userservice.ExtraerDatosPorEmail(correoIngresado)
    return restoDatos;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////

}
