import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryOrganization } from '../../inventory/entities/inventory-organization.entity';
import { CostBook } from './cost-book.entity';

@Entity('cst_cost_organizations')
export class CostOrganization {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    costOrgName!: string;

    @Column({ type: 'varchar' })
    costOrgCode!: string;

    // Link to Inventory Org (1-to-1 or Many-to-1 depending on topology)
    // Usually 1 Inventory Org belongs to 1 Cost Org
    @ManyToOne(() => InventoryOrganization)
    inventoryOrganization!: InventoryOrganization;

    // Link to Primary Cost Book
    @ManyToOne(() => CostBook)
    primaryCostBook!: CostBook;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
