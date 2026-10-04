import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categoria } from "../../categoria/entities/categoria.entity";
import { AlmacenProducto } from "../../almacen/entities/almacen_producto.entity";
import { movimiento } from "src/modules/admin/nota/entities/movimiento.entity";

@Entity('Productos')
export class Producto {

    @PrimaryGeneratedColumn()
    id!:number;

    @Column({length:200})
    nombre!:string;     

    @Column({type:'text'})
    descripcion?:string;

    @Column({type: 'decimal', precision:12, scale:2})
    precio_Venta!: number;
    
    @Column({length:255, nullable:true})
    imagen?: string;

    @Column()
    estado!:boolean

    @ManyToOne(()=>Categoria, cat=>cat.productos, {eager:true})
    categoria!: Categoria;

    @OneToMany(()=>AlmacenProducto, ap=>ap.productos)
    pinchesAlmacenes!:AlmacenProducto[];

    @OneToMany(()=>movimiento, movimiento=>movimiento.producto)
    pinchesMovimientoProductos!: movimiento[];

    }