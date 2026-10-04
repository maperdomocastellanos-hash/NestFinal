import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sucursal } from "../../sucursal/entities/sucursal.entity";
import { AlmacenProducto } from "./almacen_producto.entity";
import { movimiento } from "src/modules/admin/nota/entities/movimiento.entity";

@Entity('Almacenes')
export class Almacen {

    @PrimaryGeneratedColumn()
    docEntry!:number;

    @Column({length:100})
    Nombre!:string;

    @Column({length:100, nullable:true})
    codigoAlmacen!:string;

    @Column({type:'text', nullable:true})
    descripcion!: string;

    @ManyToOne(()=> Sucursal, suc=>suc.almacen, {eager:true})
    sucursal!: Sucursal;
    

    @OneToMany(()=>AlmacenProducto, ap=>ap.Almacenes)
    pinchesproductos!: AlmacenProducto[];

    @OneToMany(()=>movimiento, mov=>mov.almacen)
    pincheMovimientoAlmacen!:movimiento[];


}