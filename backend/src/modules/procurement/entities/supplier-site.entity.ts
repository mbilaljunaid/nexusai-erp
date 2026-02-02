import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity('procure_supplier_sites')
export class SupplierSite {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    siteName!: string; // e.g., 'HEADQUARTERS', 'NY-SALES'

    @Column({ type: 'boolean', default: true })
    isPurchasing!: boolean;

    @Column({ type: 'boolean', default: true })
    isPay!: boolean;

    @Column({ type: 'varchar', nullable: true })
    addressLine1?: string;

    @Column({ type: 'varchar', nullable: true })
    addressLine2?: string;

    @Column({ type: 'varchar', nullable: true })
    city?: string;

    @Column({ type: 'varchar', nullable: true })
    state?: string;

    @Column({ type: 'varchar', nullable: true })
    postalCode?: string;

    @Column({ type: 'varchar', nullable: true })
    country?: string;

    @ManyToOne(() => Supplier, (supplier) => supplier.sites)
    supplier!: Supplier;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
