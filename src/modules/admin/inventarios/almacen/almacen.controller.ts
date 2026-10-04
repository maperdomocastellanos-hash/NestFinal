import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlmacenService } from './almacen.service';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { Sucursal } from '../sucursal/entities/sucursal.entity';



@Controller('almacen')
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  @Post()
  create(@Body() createAlmacenDto: CreateAlmacenDto) {
    return this.almacenService.create(createAlmacenDto);
  }

  @Get()
  findAll(@Query('sucursal') sucursalId: string) {    
  // @Query('sucursal'): Extrae el valor de la Query String llamada sucursal de la URL.
  // Ejemplo de URL: GET /almacenes?sucursal=5
  return this.almacenService.listarAlmacen(Number(sucursalId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.almacenService.Mostrar(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlmacenDto: UpdateAlmacenDto) {
    return this.almacenService.update(+id, updateAlmacenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.almacenService.remove(+id);
  }
}
