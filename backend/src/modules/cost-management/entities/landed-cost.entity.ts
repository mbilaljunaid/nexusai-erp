import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrder } from '../../procurement/entities/purchase-order.entity';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';

export type ChargeBasis = 'Value' | 'Quantity' | 'Weight' | 'Volume';
export type ChargeType = 'Freight' | 'Insurance' | 'Duty' | 'Handling' | 'Other';

@Entity('cst_landed_costs')
export class LandedCostCharge {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => InventoryOrganization)
    organization!: InventoryOrganization;

    // Link to PO Header (Estimated Charges)
    @ManyToOne(() => PurchaseOrder, { nullable: true })
    purchaseOrder?: PurchaseOrder;

    // Future: Link to Receipt (Actual Charges) or Invoice
    // For now, we define charges on the PO level and allocate to Receipts.

    @Column({ type: 'varchar' })
    chargeType!: ChargeType;

    @Column('decimal', { precision: 18, scale: 4 })
    amount!: number;

    @Column({ type: 'varchar' })
    currencyCode!: string;

    @Column({ type: 'varchar', default: 'Value' })
    allocationBasis!: ChargeBasis;

    @Column({ type: 'boolean', default: false })
    isEstimated!: boolean;

    @Column({ type: 'varchar', nullable: true })
    vendorName?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
