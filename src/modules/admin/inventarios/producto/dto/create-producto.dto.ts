import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateProductoDto {
  
  @ApiProperty({example: 'Laptop Levono Thinkpad E14',description: 'Nombre del producto'})
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(200, {message: 'El nombre no puede exceder los 200 caracteres'})
  nombre!: string;


  @ApiPropertyOptional({example: 'Detergente para ropa con aroma floral',description: 'Descripción del producto'})
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;


  @ApiProperty({example: 125.50,description: 'Precio de venta del producto'})
  @IsNumber({ maxDecimalPlaces: 2 },{ message: 'El precio de venta debe ser un número válido' })
  @IsPositive({message: 'El precio de venta debe ser mayor que cero'})
  precio_Venta!: number;


  @ApiPropertyOptional({example: 'https://misitio.com/imagenes/producto.jpg',description: 'Ruta o URL de la imagen'})
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @MaxLength(255, {message: 'La imagen no puede exceder los 255 caracteres'})
  imagen?: string;


  @ApiProperty({example: true,description: 'Estado del producto'})
  @IsBoolean({message: 'El estado debe ser verdadero o falso'})
  estado!: boolean;


  @ApiProperty({example: 3,description: 'Id de la categoría asociada'})
  @IsNumber({},{ message: 'El id de la categoría debe ser numérico' })
  @IsNotEmpty()
  categoriaId!: number;

}