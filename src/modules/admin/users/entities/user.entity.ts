import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../../roles/entities/role.entity";

@Entity()
export class User {

     @PrimaryGeneratedColumn('uuid')
    id!: string;   

    @Column({ type: 'varchar', length: 50 })
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ default: true })
    status!: boolean;

    @ManyToMany(()=>Role, rol => rol.users, {eager:true})
    @JoinTable({
        name:'user_role',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
            inverseJoinColumn:{
            name: 'role_id',
            referencedColumnName: 'id'
        }

    })
    roles?: Role[];

    

}
