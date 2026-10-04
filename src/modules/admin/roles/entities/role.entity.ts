import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { permission } from "process";
import { Permission } from "../../permission/entities/permission.entity";


@Entity('roles')
export class Role {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    
    @ManyToMany(() => User, (user) => user.roles)
    users?: User[];

    @ManyToMany(()=> Permission, perm=>perm.roles, {eager:true})
        @JoinTable({
            name: 'permission_role',
            joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id'
            },
            inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id'    
            }    
       })

    permission?: Permission[];



}
