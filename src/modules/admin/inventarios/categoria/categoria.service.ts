import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria) private readonly categoriaRepository: Repository<Categoria>
  )
  {}

////////////////////////////////////////////////////////////////////////////////////////////////////

  async listarCategoria() {
    try {
      return await this.categoriaRepository.find()
    } catch (error) {
      console.error(error); // <-- agrega esto
      throw new InternalServerErrorException('Error al listar las categorías');  
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////

  async crearCategoria(nuevaCategoria: CreateCategoriaDto) {
    const existeCategoria = await this.categoriaRepository.findOne({where: {nombre: nuevaCategoria.nombre}})
    if(existeCategoria){
      throw new BadRequestException(`Ya existe la categoria ${nuevaCategoria.nombre}`)
    }
    const nuevaCat =  this.categoriaRepository.create(nuevaCategoria);
    return await this.categoriaRepository.save(nuevaCat);
  }


////////////////////////////////////////////////////////////////////////////////////////////////////

  async mostrarunaCategoria(id: number) {
    try {
      const categoria = await this.categoriaRepository.findOne({where: {id:id},relations: {productos:true}});
      if (!categoria) throw new NotFoundException(`Categoría con id ${id} no fue encontrada`);
      return categoria;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al mostrar la categoría');
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////

  async modificarCategoria(id: number, datos: UpdateCategoriaDto) {
  try {
    const categoria = await this.categoriaRepository.update(id, datos);
    if (categoria.affected===0)       //"¿el UPDATE no modificó ninguna fila?"
         throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    return categoria    
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Error al modificar la categoría');
  }
}
  
////////////////////////////////////////////////////////////////////////////////////////////////////

  eliminarCategoria(id:number){
   
    }


} 
