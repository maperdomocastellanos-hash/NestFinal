import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productoService.create(createProductoDto);
  }

  
  @Get()
  @ApiQuery({name: 'search', required: false, type: String})       // @ApyQuery es exclusivo si estoy usando SWAGGER 
  @ApiQuery({name: 'warehouse', required: false, type: Number})    // @ApyQuery es exclusivo si estoy usando SWAGGER 
  @ApiQuery({name: 'page', required: false, type: Number}) 
  @ApiQuery({name: 'limit', required: false, type: Number}) 
  @ApiQuery({name: 'estatus', required: false, type: Boolean}) 

  async findAll(
      //Todo esto tambien se puede trabajar desde un DTO
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('search') search: string = '',
      @Query('warehouse') warehouse: number = 0,
      @Query('estatus') estatus: boolean = true
    ) 
    
  // SI COLOCO EL FILTRO DENTRO DEL ARCHIVO DEL DTO ME AHORRO TODO ESTO. 
  
  // Si utilizas un DTO para recibir los filtros 
  // NO necesitas poner ningún @ApiQuery() en el controlador. Swagger inspecta automáticamente la clase 
  // del DTO y genera todos los campos de búsqueda en la documentación por ti.

  // EN NOTA PODEMOS VER QUE HICIMOS FIND.NOTA.DTO Y EL PROCESO ES MAS CORTO QUE ESTE, SE PUEDE
  // DE AMBAS MANERAS
  
  {
      return await this.productoService.listarProducto(page, limit,search,warehouse,estatus )     //hay que colocar todo en el mismo orden de producto.service.ts
    }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.mostrarUnRegistro(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productoService.actualizarProductos(+id, updateProductoDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(+id);
  }

  
  @Post(':id/actualizar-imagen')
  @UseInterceptors(FileInterceptor('image'))       //imagen es variable
  @ApiConsumes('multipart/form-data') 
  @ApiBody
  ({
    schema: {
        type: 'object',
        properties: {
           image:{
              type: 'string',
              format: 'binary'
    }}}
      
  })
  subirImagen(@UploadedFile() file: Express.Multer.File, @Param('id') id:number) {
  return this.productoService.subirImagen(file,id)


}


}
