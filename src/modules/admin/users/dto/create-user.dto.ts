import { ApiProperty } from '@nestjs/swagger';
import {IsString,IsEmail,IsNotEmpty,MaxLength,MinLength, IsOptional, IsArray} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({description: 'Nombre completo del usuario',example: 'Manuel Pineda',maxLength: 50,})
  @IsNotEmpty()
  @IsString({message: "El nombre de usuario debe de ser cadena de texto"})
  @MaxLength(20, {message: "el nombre de usuario no debe de exceder los 20 caracteres"})
  @MinLength(10, {message: "el nombre de usuario debe tener al menos 10 caracteres"})
  name!: string;

  @ApiProperty({description: 'Correo electrónico único del usuario',example: 'manuel@jaremar.com',})
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({description: 'Contraseña del usuario (se almacena hasheada con bcrypt)',example: 'Passw0rd123!',minLength: 8,})
  @IsString({message: "La contraseña debe de ser una cadena de texto"})
  @IsNotEmpty()
  @MaxLength(20, {message: "el nombre de usuario no debe de exceder los 20 caracteres"})
  @MinLength(8, {message: "el nombre de usuario debe tener al menos 5 caracteres"})
  password!: string;

  @ApiProperty()
  @IsOptional()
  @IsArray({message: 'Los Ids de roles deben de ser un arreglo [].'})
  roleId?: number[];


}
