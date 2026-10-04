import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ClienteProveedor } from "../../cliente-proveedor/entities/cliente-proveedor.entity";
import { User } from "../../users/entities/user.entity";
import { movimiento } from "./movimiento.entity";


@Entity('notas')

export class Nota {
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    fecha!:Date;

    @Column()
    tipo_nota!: string   //compra - venta

    @Column({length:50})
    estadoNota!: string; 

    @Column()
    observaciones?:string;

    @ManyToOne(()=>User,{eager:true})       
    user!: User
    //aca no coloco el segundo parametro porque decidi 
    // que no necesito la relacion inversa de usuario hacia notas la usaria si quiero navegar en 
    //ambos sentidos, ENTONCES  es suficiente con colocarlo asi como esta arriba.

                /* En User (si tuvieras la relación inversa):
                @OneToMany(()=>Nota, nota => nota.user)
                notas?: Nota[];

                En Nota:
                ManyToOne(()=>User, user => user.notas, {eager:true})
                user!: User*/

    //mismo caso de user en la linea anterior. 
    @ManyToOne(()=>ClienteProveedor, {eager:true})                    // muchas notas para un cliente  / proveedor
    clienteproveedor!:ClienteProveedor


    @OneToMany(()=>movimiento, movimiento=> movimiento.nota)
    movimientos!: movimiento[]



}

