import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CstCostDistribution } from './cst-cost-distribution.entity';
import { CstItemCost } from './cst-item-cost.entity';
// Avoid importing CmrReceiptDistribution if not needed, or use string/lazy

@Entity('cst_cost_organizations')
export class CostOrganization {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    code!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar' })
    inventoryOrganizationId!: string; // Link to Inventory Org

    @CreateDateColumn()
    createdAt!: Date;
}
