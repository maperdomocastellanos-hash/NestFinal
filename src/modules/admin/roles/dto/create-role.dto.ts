import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray, IsInt } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRoleDto {

    @ApiProperty({description: 'Nombre único del rol',example: 'admin', maxLength: 50})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name!: string;

    @ApiPropertyOptional({description: 'Descripción del rol',example: 'Rol con acceso total al sistema'})
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({description: 'IDs de los permisos a asociar con el rol',example: [1, 2, 3],type: [Number]})
    @IsArray()
    @IsOptional()
    @IsInt({ each: true })
    permissionIds?: number[];
}