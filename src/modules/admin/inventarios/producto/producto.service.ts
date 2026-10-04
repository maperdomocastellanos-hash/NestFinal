import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Repository } from 'typeorm';
import { Categoria } from '../categoria/entities/categoria.entity';

@Injectable()
export class ProductoService {

constructor(
  @InjectRepository(Producto) private readonly productoRepository: Repository<Producto>,
  @InjectRepository(Categoria) private readonly categoriaRepository: Repository<Categoria>
)
{}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async listarProducto(
    // filtros
    page: number = 1,
    limit: number = 10,
    search: string= '',
    almacen: number = 0,
    estatus: boolean = true
  ) {

    //  QueryBuilder de TypeORM => una forma de construir consultas SQL de manera más flexible y 
    //  explícita que usando find()/findOne(). En vez de pasarle un objeto de opciones, 
    //  vas encadenando métodos que arman el SQL paso a paso.

    //¿Por qué usar QueryBuilder en vez de find({relations: {...}})?
    // Porque cuando tienes relaciones anidadas a varios niveles (como aquí: producto → productoAlmacen → almacén) o 
    // necesitas condiciones más complejas (subqueries, joins condicionales, agregaciones), el find() con relations 
    // se vuelve limitado o menos legible. El QueryBuilder te da control total del SQL generado.
    
    const queryBuilder = this.productoRepository.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.pinchesAlmacenes','productoAlmacen')
      .leftJoinAndSelect('productoAlmacen.almacenes','almacen')
      .leftJoinAndSelect('producto.categoria','categoria')
      .where('producto.estado = :status',{status:estatus});

      // Si viene un almacén específico, filtramos.
      // Esto hace que SOLO aparezcan productos que tengan
      // un registro en pinchesAlmacenes para ESE almacén.
      // Productos sin stock en ese almacén quedan excluidos del resultado.

      if(almacen && almacen>0){
          queryBuilder.andWhere('almacen.id = :alma', {alma: almacen})   
          //'almacen.id' => es el almacen Alias definido arriba
      }

      //Filtro de busqueda por el nombre del producto
      if(search?.trim()){
          queryBuilder.andWhere('producto.nombre ILIKE :search',{search: `%${search}%`})   //%${search}% encuentra coincidencias parciales en cualquier parte del texto
      }

      //Paginacion  
      queryBuilder.skip((page - 1) * limit)   
      .take(limit);

      //Retornamos los datos y el total de registros para armar la paginación en el frontend
      const [productos, total] = await queryBuilder.getManyAndCount();  
      const totalPages = Math.ceil(total / limit)

      /*    resultado = [ [ {producto1}, {producto2}, ... ], 47 ]
                       ↑ posición 0                      ↑ posición 1
                     array de productos                número total

      esas dos ultimas líneas dan todo lo necesario para armar la paginación en el frontend: 
      los productos de la página actual, y cuántas páginas hay en total para que el frontend 
      pueda mostrar los botones de navegación (1, 2, 3... 5).

      
       => Método	                 Qué retorna
      .getOne()	            Un solo registro (o null)
      .getMany()	          Un arreglo de registros — sin el total
      .getCount()	          Solo el número total — sin los registros
      .getManyAndCount()	  Ambos: [registros, total]

      getManyAndCount() es el disparador de toda la consulta de arriba sin eso no funcionaria el codigo
      */

      return{
        data:productos,
        total, 
        limit, 
        page, 
        totalPages,
        estatus,
        almacen,
        search
      }
  }   

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async create(createProductoDto: CreateProductoDto) {
  try {
    const categoria = await this.categoriaRepository.findOne({where: {id:createProductoDto.categoriaId}})
    if(!categoria) 
    {
      throw new NotFoundException('Categoria no encontrada')
    }
    const existeProducto = await this.productoRepository.findOne({where: {nombre:createProductoDto.nombre}});
    if(existeProducto)
    {
      throw new BadRequestException(`Ya existe un producto con el nombre "${createProductoDto.nombre}" dentro de la categoria "${createProductoDto.categoriaId}"`)
    }

    const newProducto = this.productoRepository.create({...createProductoDto, categoria});
    return this.productoRepository.save(newProducto);
    
  } catch (error) {
    if (error instanceof HttpException) {   // cubre NotFoundException, BadRequestException, etc.
    throw error;
  }
    throw new InternalServerErrorException('Error al guardar el Producto');
  }}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async mostrarUnRegistro(id: number): Promise<Producto> {        //Promise<Producto>, le estás diciendo a TypeScript: "confía en mí, esta función garantiza que si retorna algo, nunca es null
  const producto = await this.productoRepository.findOneBy({ id });
  if (!producto) {
    throw new NotFoundException(`Producto con id ${id} no encontrado`);
  }
  return producto;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

 async actualizarProductos(id: number, updateProductoDto: UpdateProductoDto) {
  try {
    const producto = await this.mostrarUnRegistro(id);

    const { categoriaId, ...restoCampos } = updateProductoDto;

    if (categoriaId) {
      const categoria = await this.categoriaRepository.findOne({ where: { id: categoriaId } });
      if (!categoria) {
        throw new NotFoundException(`Categoría con id ${categoriaId} no encontrada`);
      }
      producto.categoria = categoria;           //producto.categoria (campo categoria en entidad producto)
    }

    Object.assign(producto, restoCampos);
    return await this.productoRepository.save(producto);

  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException('Error al actualizar el producto');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

  remove(id: number) {
    
  }

//**********************************************************************************************************************************


async subirImagen(file:Express.Multer.File, id:number){
  const validarImagen = ['image/png','image/jpeg','image/jpg'];
  if(!validarImagen.includes(file.mimetype))
    {
        throw new BadRequestException('El formato ingresado no es valido');
    }

// Validar tamaño del archivo 
    const maxSize = 5*1024*1024;
    if(file.size>maxSize)
    {
        throw new BadRequestException('El archivo es muy grande')
    }
    const prod = await this.mostrarUnRegistro(id)
    prod.imagen = file.path;
    this.productoRepository.save(prod)

    return{message: 'archivo subido', filepath:file.path}                //lo que va dentro de {} es un objeto


}




}
