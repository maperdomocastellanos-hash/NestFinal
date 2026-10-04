import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClienteProveedorService } from './cliente-proveedor.service';
import { CreateClienteProveedorDto } from './dto/create-cliente-proveedor.dto';
import { UpdateClienteProveedorDto } from './dto/update-cliente-proveedor.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('cliente-proveedor')
export class ClienteProveedorController {
  constructor(private readonly clienteProveedorService: ClienteProveedorService) {}

  @Post()
  create(@Body() createClienteProveedorDto: CreateClienteProveedorDto) {
    return this.clienteProveedorService.Crear(createClienteProveedorDto);
  }

  @Get()
  @ApiQuery({name: 'search',required: false,type: String,description: 'Filtro por Razón Social'})
  async listarClienteProveedor(
                                @Query('search') search?: string) {
    return await this.clienteProveedorService.ListarclienteProveedor(search);
  }
  //VER MISMO PROCEDIMIENTO EN PRODUCTO.CONTROLLER


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteProveedorService.MostrarUno(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteProveedorDto: UpdateClienteProveedorDto) {
    return this.clienteProveedorService.ActualizarCP(+id, updateClienteProveedorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteProveedorService.remove(+id);
  }
}
