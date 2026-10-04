import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("v1/autenticacion/login")
  funIngresarCredenciales(@Body() LoginAuthDto: LoginAuthDto) {
    return this.authService.funLogin(LoginAuthDto.email, LoginAuthDto.pwUsuario);
  }

  
  @UseGuards(AuthGuard)
    @Get("v1/autenticacion/profile")
    funProfile(@Request() req: any) 
    {
      return this.authService.funGetPerfil(req.user.email)
    }

}
