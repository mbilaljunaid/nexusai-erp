import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SupplierSite } from './supplier-site.entity';

@Entity('procure_suppliers')
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    supplierNumber!: string;

    @Column()
    supplierName!: string;

    @Column({ nullable: true })
    taxRegistrationNumber?: string;

    @Column({ nullable: true })
    dunsNumber?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ default: true })
    active!: boolean;

    @Column({ nullable: true })
    supplierType?: string; // e.g., 'STANDARD', 'CONTRACTOR'

    @OneToMany(() => SupplierSite, (site) => site.supplier, { cascade: true })
    sites!: SupplierSite[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
