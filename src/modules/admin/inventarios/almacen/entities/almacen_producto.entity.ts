//Se crea una tabla nueva por la relacion many to many

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Almacen } from "./almacen.entity";
import { Producto } from "../../producto/entities/producto.entity";

@Entity()
export class AlmacenProducto{

    @PrimaryGeneratedColumn()
    id!:number;

    @Column({type: 'int'})
    cantidadActual!: number; 

    @Column({type: 'date',nullable: true})
    fechaActualizacion?:Date; 

    @ManyToOne(()=>Almacen, alma=>alma.pinchesproductos, {eager:true})
    Almacenes!: Almacen;

    @ManyToOne(()=>Producto, prod=>prod.pinchesAlmacenes, {eager:true})
    productos!: Producto;

}