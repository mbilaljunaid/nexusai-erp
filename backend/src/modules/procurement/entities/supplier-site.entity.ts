import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity('procure_supplier_sites')
export class SupplierSite {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    siteName!: string; // e.g., 'HEADQUARTERS', 'NY-SALES'

    @Column({ default: true })
    isPurchasing!: boolean;

    @Column({ default: true })
    isPay!: boolean;

    @Column({ nullable: true })
    addressLine1?: string;

    @Column({ nullable: true })
    addressLine2?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    postalCode?: string;

    @Column({ nullable: true })
    country?: string;

    @ManyToOne(() => Supplier, (supplier) => supplier.sites)
    supplier!: Supplier;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
