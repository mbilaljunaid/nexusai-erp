import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SupplierSite } from './supplier-site.entity';

@Entity('procure_suppliers')
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    supplierNumber!: string;

    @Column({ type: 'varchar' })
    supplierName!: string;

    @Column({ type: 'varchar', nullable: true })
    taxRegistrationNumber?: string;

    @Column({ type: 'varchar', nullable: true })
    dunsNumber?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'boolean', default: true })
    active!: boolean;

    @Column({ type: 'varchar', nullable: true })
    supplierType?: string; // e.g., 'STANDARD', 'CONTRACTOR'

    @Column({ type: 'varchar', default: 'Net 30' })
    paymentTerms!: string;

    @OneToMany(() => SupplierSite, (site) => site.supplier, { cascade: true })
    sites!: SupplierSite[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
