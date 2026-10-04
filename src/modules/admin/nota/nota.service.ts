import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ClienteProveedor } from '../cliente-proveedor/entities/cliente-proveedor.entity';
import { Nota } from './entities/nota.entity';
import { Producto } from '../inventarios/producto/entities/producto.entity';
import { Almacen } from '../inventarios/almacen/entities/almacen.entity';
import { movimiento } from './entities/movimiento.entity';
import { AlmacenProducto } from '../inventarios/almacen/entities/almacen_producto.entity';
import { filtroNotadto } from './dto/filtro-nota.dto';

@Injectable()
export class NotaService {
  constructor (
    @InjectDataSource() private DC :DataSource,
    @InjectRepository(Nota) private readonly notaRepositorio: Repository<Nota>
    )
{}

    
// El patrón de fondo es siempre el mismo:

// 1. Abrir transacción
// 2. Validar todo lo que necesitas
// 3. Crear/modificar entidades
// 4. Confirmar o revertir
// 5. Liberar recursos


  // => Inicio de la transacción esto va fijo

  // EL USO de transacciones es necesario en aquellos modulos que se toca mas de dos tablas: como en este
 
    

  async create(x: CreateNotaDto) {
        const queryRunner = this.DC.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();  //abrimos transaccion

   try {
      // Obtener los repositorios desde el queryRunner:
      const userRepositorio = queryRunner.manager.getRepository(User);
      const CliProRepositorio = queryRunner.manager.getRepository(ClienteProveedor);
      const notaRepositorio = queryRunner.manager.getRepository(Nota);
      const productoRepositorio = queryRunner.manager.getRepository(Producto);
      const almaRepositorio = queryRunner.manager.getRepository(Almacen);
      const movRepositorio = queryRunner.manager.getRepository(movimiento);


      // Validar que el usuario exista:
      const existeUser = await userRepositorio.findOneBy({id: x.userId});
      if(!existeUser){
        throw new NotFoundException("Usuario no encontrado")
      }

      // Validar que el cliente/proveedor exista: 
      const existeCP = await CliProRepositorio.findOneBy({ id: x.clienteProveedorId});
      if(!existeCP) throw new NotFoundException('Informacion no encontrada')

         const crearNota = notaRepositorio.create({
        ...x,
        user: existeUser,
        clienteproveedor: existeCP
      })  

      await notaRepositorio.save(crearNota);


      // => Preparás una carpetita vacía en tu escritorio:
      const movimientosGuardados: movimiento[] = []     

      for (const a of x.movimientos)
        {

        const existeProd = await productoRepositorio.findOneBy({ id: a.producto_id});
        if(!existeProd) throw new NotFoundException('Producto no encontrado')

        // ¿La jaula donde va a vivir este Chungo existe en el refugio?
        const existeAlmacen = await almaRepositorio.findOneBy({ docEntry: a.almacen_id});
        if(!existeAlmacen) throw new NotFoundException('Almacen no encontrado')

        const crearMovimiento= movRepositorio.create({
            ...a,
            producto: existeProd,
            almacen: existeAlmacen, 
            nota: crearNota
        }) 

        // => Andá a la pizarra de jaulas y actualizá el conteo. La jaula 7 ahora tiene un Chungo más.
      await this.actualizarstock_QueryRunner(
          queryRunner, 
          existeAlmacen, 
          existeProd, 
          a.cantidad, 
          a.tipoMovimiento
        )  // parametros de la funcion: 


        const guardarMovimiento = await movRepositorio.save(crearMovimiento);
        movimientosGuardados.push(guardarMovimiento);         

        }

          crearNota.movimientos = movimientosGuardados;              // => Agarrás el libro de registro general y le engrapás todas las fichas de la carpetita.
          await queryRunner.commitTransaction();                // => Le decís al asistente: "Todo está bien. Pasá todo a tinta permanente."
          return crearNota; 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;

      } finally {
          await queryRunner.release();
      }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////

private async actualizarstock_QueryRunner(   
  queryRunner: QueryRunner,       
  almacen: Almacen,             // la clase Almacen   
  producto: Producto,           // La clase Producto
  cantidad: number, 
  tipoMovimiento: 'ingreso' | 'salida' | 'devolucion'
) {

  const almacenProductoRepo = queryRunner.manager.getRepository(AlmacenProducto)

  let alma_prod = await almacenProductoRepo.findOne({ 
    where: {
      Almacenes: {docEntry: almacen.docEntry},   // ← corregido: minúscula, igual que en la entidad
      productos: { id: producto.id }
    },
  });


  if (!alma_prod) {                       // si no existe relación entre prod-almacen
    if (tipoMovimiento === 'salida') {    // salida pero sin relación entre almacen - producto
      throw new BadRequestException('No hay stock registrado para este producto en este almacen')
    }
    // como en este caso no existe la relación, se ingresa por primera vez: 
    alma_prod = almacenProductoRepo.create({
      Almacenes: almacen, 
      productos: producto, 
      cantidadActual: 0 + cantidad,   
      fechaActualizacion: new Date()
    })

  } else {

    if (tipoMovimiento === 'ingreso' || tipoMovimiento === 'devolucion') {
      alma_prod.cantidadActual = alma_prod.cantidadActual + cantidad;
    } else if (tipoMovimiento === 'salida') {
      if (alma_prod.cantidadActual < cantidad) {
        throw new BadRequestException('Stock insuficiente')
      }
      alma_prod.cantidadActual = alma_prod.cantidadActual - cantidad;
    }
    alma_prod.fechaActualizacion = new Date();
  }

  await almacenProductoRepo.save(alma_prod);   // guarda o actualiza el stock
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

  async listarNota(filtro: filtroNotadto) {
      const queryBuilder = this.notaRepositorio.createQueryBuilder('nota')
      .leftJoinAndSelect('nota.user','user')
      .leftJoinAndSelect('nota.clienteproveedor', 'clienteproveedor')
      
      .leftJoinAndSelect('nota.movimientos','movimientos')
      .leftJoinAndSelect('movimientos.producto','producto')

      //Esta parte de arriba se hace para que desde el frontend podamos hacer una cosa consulta de un 
      //determinado asunto, es decir, al trabajar con notas el backend me va a llevar
      // iinformacion del producto, del cliente proveedor, y lo que hay dentro de ellas
      //entonces en el frontend no necesito hacer consultas separadas, todo va el la respuesta del backend
      

  if(filtro.tipo_nota){
    queryBuilder.andWhere('nota.tipo_nota = :tipo_notas', { tipo_notas: filtro.tipo_nota})
  }  

  if(filtro.estadoNota){
    queryBuilder.andWhere('nota.estadoNota = :estadoNota', { estadoNota: filtro.estadoNota})
  }  

  if(filtro.desde){
      queryBuilder.andWhere('nota.fecha = :desde', { desde: filtro.desde });
  }

  if(filtro.hasta){
    queryBuilder.andWhere('nota.fecha = :hasta', { hasta: filtro.hasta });
  }

    if(filtro.user){
      queryBuilder.andWhere('nota.user = :user', { user: filtro.user });
    }

    if(filtro.clienteproveedor){
      queryBuilder.andWhere('nota.clienteproveedor = :clienteproveedor', { clienteproveedor: filtro.clienteproveedor });
    }

    queryBuilder.orderBy('nota.fecha', 'DESC');

    //Paginacion
    const limit = filtro.limit || 10
    const page = filtro.page || 1

    queryBuilder.skip((page - 1) * limit)
    .take(limit);

  const [productos, total] = await queryBuilder.getManyAndCount();
  const totalPages = Math.ceil(total / limit)

  return {data: productos, total}};

///////////////////////////////////////////////////////////////////////////////////////////////////////

   //Funcion mostrar por ID
  async Mostrar(id: number) {
    const Producto = await this.notaRepositorio.findOneBy({id});
    if(!Producto)
    {
      throw new NotFoundException(`Producto con ${id} no encontrado`)
    }
    return Producto;
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////

   // Pasos en orden de actualizar: 
  

// 1. Crea un queryRunner y conecta todos los repositorios dentro de la misma transacción — si algo falla, todo se revierte junto.
// 2. Busca la nota - Busca la nota por id trayendo sus movimientos con producto y almacen incluidos. Si no existe lanza un 404.

// 3. Actualiza el encabezado de la nota
// 3.1 Si viene userId → valida que el usuario exista y lo asigna
// 3.2 Si viene clienteProveedorId → valida que exista y lo asigna
// 3.3 El resto de campos (fecha, tipo_nota, estadoNota, observaciones) los pisa con Object.assign y guarda la nota

// 4. Por cada movimiento del DTO:
// 4.1 Busca el movimiento existente en BD con su producto y almacen. Si no existe lanza 404.
// 4.2 Revierte el stock anterior — aplica el tipo inverso (ingreso→salida, salida→ingreso) para dejar el stock como estaba antes de ese movimiento.
// 4.3 Valida que el producto y almacen nuevos existan en BD.
// 4.4 Valida que vengan cantidad y tipoMovimiento en el DTO.
// 4.5 Aplica el stock nuevo con los datos actualizados.
// 4.6 Pisa los campos del movimiento con Object.assign y lo guarda.

// 5. Confirma la transacción
// 6. Si todo salió bien hace commitTransaction.
// 7. Devuelve la nota actualizada

// Hace un findOne final con todas las relaciones para retornar el estado actualizado.
// 7. Si algo falla en cualquier punto

// Hace rollbackTransaction — todo vuelve al estado original. Si el error es un HttpException lo relanza tal cual, si no lanza un 500 genérico.
// 8. Siempre al final

// queryRunner.release() libera la conexión sin importar si hubo error o no (está en el finally).

  async actualizarNota(id: number, datos: UpdateNotaDto) {
  const queryRunner = this.DC.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {                           // importamos todos los .getrepository porque asi hacemos un solo paquete de transaccion, si falla una cosa, falla todo en conjunto
    const usuarioRepo          = queryRunner.manager.getRepository(User);
    const clienteProveedorRepo = queryRunner.manager.getRepository(ClienteProveedor);
    const notaRepo             = queryRunner.manager.getRepository(Nota);
    const productoRepo         = queryRunner.manager.getRepository(Producto);
    const almacenRepo          = queryRunner.manager.getRepository(Almacen);
    const movRepo              = queryRunner.manager.getRepository(movimiento);

    // 1. Buscar la nota existente con sus movimientos:
    const nota = await notaRepo.findOne({
      where: { id: id }, 
        relations: 
          {movimientos: 
            {producto: true,
              almacen: true,
            }
        }
      }
    )    
           // aca le digo:       
      // => buscá la nota cuyo id coincida con el que llegó por parámetro
      // => y además traeme también...
      // => ...sus movimientos, y dentro de cada movimiento...
      // => ...el producto asociado
      // => ...el almacen asociado
    if (!nota) throw new NotFoundException(`Nota con id ${id} no encontrada`);


    // 1.1. si existe, actualizar encabezado de la nota
    if (datos.userId) {
      const existeUser = await usuarioRepo.findOneBy({ id: datos.userId });
      if (!existeUser) throw new NotFoundException('Usuario no encontrado');
      nota.user = existeUser;
    }

    if (datos.clienteProveedorId) {
      const existeCP = await clienteProveedorRepo.findOneBy({ id: datos.clienteProveedorId });
      if (!existeCP) throw new NotFoundException('Cliente/Proveedor no encontrado');
      nota.clienteproveedor = existeCP;
    }
    
    const { userId, clienteProveedorId, movimientos, ...restoNota } = datos;

    Object.assign(nota, restoNota);
    await notaRepo.save(nota);

    // 2. Manejo de movimientos
    if (movimientos && movimientos.length > 0) {        // movimientos, es el campo del DTO update

      for (const mov of movimientos) {

      const movExistente = await movRepo.findOne({  // busca un único registro o null
        where: { id: mov.id },                      // id de entity movimiento  <=> contra id que viene del DTO
          relations: {
            producto: true,                           // hace JOIN con la tabla productos
            almacen: true,         
      // Busca la ficha del Chungo número 5, y cuando la encuentres, 
      // no me traigas solo la ficha — tráeme también el expediente completo del producto que movió, 
      // y el expediente completo del almacén donde ocurrió."
            
  },
});

        if (!movExistente) throw new NotFoundException(`Movimiento con id ${mov.id} no encontrado`);

        // 2.1 si el movimiento ya existe, entonces revierte los valores: 
        const inverso = {ingreso: 'salida', salida: 'ingreso', devolucion: 'salida', } as const;
        const tipoInverso = inverso[movExistente.tipoMovimiento]; 

        //2.2 Actualizar query con los inversos// pasamos los parametros:
          await this.actualizarstock_QueryRunner(
            queryRunner,
            movExistente.almacen,
            movExistente.producto,
            movExistente.cantidad,
            tipoInverso,
          );

        // 3. Validar producto y almacen nuevos
        const existeProd = await productoRepo.findOneBy({ id: mov.producto_id });
        if (!existeProd) throw new NotFoundException('Producto no encontrado');

        const existeAlmacen = await almacenRepo.findOneBy({ docEntry: mov.almacen_id });
        if (!existeAlmacen) throw new NotFoundException('Almacen no encontrado');

        if (!mov.cantidad || !mov.tipoMovimiento) {
         throw new BadRequestException(`El movimiento con id ${mov.id} debe tener cantidad y tipoMovimiento`);
        }

        // 4. Aplicar el stock nuevo
        await this.actualizarstock_QueryRunner(
          queryRunner,
          existeAlmacen,
          existeProd,
          mov.cantidad,
          mov.tipoMovimiento,
        );

        // 5. sobreescribiendo los campos del movimiento
        Object.assign(movExistente, 
        {
          ...mov,
          producto: existeProd,
          almacen: existeAlmacen,
          nota,
        });

        await movRepo.save(movExistente);
      }
    }

    await queryRunner.commitTransaction();

    return await notaRepo.findOne({where: { id: id }, relations: {movimientos: {producto: true,almacen: true,},},});

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error en actualizarNota:', error);
    if (error instanceof HttpException) throw error;
    throw new HttpException(
      'Error al actualizar la nota con sus movimientos',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  } finally {
    await queryRunner.release();
  }
}
 
///////////////////////////////////////////////////////////////////////////////////////////////////////

  remove(id: number) {
    return `This action removes a #${id} nota`;
  }
}









