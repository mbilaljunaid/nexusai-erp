import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { SupplierSite } from './supplier-site.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

@Entity('procure_purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  poNumber!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Supplier)
  supplier!: Supplier;

  @ManyToOne(() => SupplierSite)
  supplierSite!: SupplierSite;

  @Column({ default: 'Draft' }) // Draft, Pending Approval, Open, Closed, Cancelled
  status!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ nullable: true })
  currencyCode?: string;

  @OneToMany(() => PurchaseOrderLine, (line) => line.purchaseOrder, { cascade: true })
  lines!: PurchaseOrderLine[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
