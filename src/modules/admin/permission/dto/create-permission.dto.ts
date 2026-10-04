import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreatePermissionDto {

    @ApiPropertyOptional({description: 'Etiqueta legible del permiso',example: 'Crear usuario',maxLength: 50})
    @IsString({ message: 'El label debe de ser una cadena de texto' })
    @IsOptional()
    @MaxLength(50, { message: 'El label no debe exceder los 50 caracteres' })
    label?: string;

    @ApiProperty({description: 'Acción que permite el permiso (ej. create, read, update, delete)',example: 'create',maxLength: 100})
    @IsString({ message: 'La acción debe de ser una cadena de texto' })
    @IsNotEmpty({ message: 'La acción es requerida' })
    @MaxLength(100, { message: 'La acción no debe exceder los 100 caracteres' })
    actions!: string;

    @ApiProperty({description: 'Recurso o entidad sobre la que aplica el permiso',example: 'user',maxLength: 100})
    @IsString({ message: 'El subject debe de ser una cadena de texto' })
    @IsNotEmpty({ message: 'El subject es requerido' })
    @MaxLength(100, { message: 'El subject no debe exceder los 100 caracteres' })
    subject!: string;
}
