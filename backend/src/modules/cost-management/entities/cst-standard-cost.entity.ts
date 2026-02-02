import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CostScenario } from './cost-scenario.entity';
import { Item } from '../../inventory/entities/item.entity';
import { CostElement } from './cost-element.entity';

@Entity('cst_standard_costs')
export class CstStandardCost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => CostScenario, scenario => scenario.costs)
    scenario!: CostScenario;

    @ManyToOne(() => Item)
    item!: Item;

    @ManyToOne(() => CostElement)
    costElement!: CostElement;

    @Column('decimal', { precision: 18, scale: 4 })
    unitCost!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
