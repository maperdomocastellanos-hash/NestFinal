import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToMany } from "typeorm";
import { Role } from "../../roles/entities/role.entity";

@Entity()
export class Permission {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, nullable:true })
    label!: string;

    @Column({ type: 'varchar', length: 100 })
    actions!: string;

    @Column({ type: 'varchar', length: 100 })
    subject!: string;

    @ManyToMany(() => Role, rol => rol.permission)
    roles!: Role[];
}
