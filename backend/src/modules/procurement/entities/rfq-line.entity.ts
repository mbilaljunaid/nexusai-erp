import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RfqHeader } from './rfq-header.entity';
import { Item } from '../../inventory/entities/item.entity';

@Entity('procure_rfq_lines')
export class RfqLine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => RfqHeader, (header) => header.lines)
    header!: RfqHeader;

    @Column({ type: 'varchar' })
    description!: string;

    @Column({ type: 'decimal', precision: 18, scale: 4 })
    targetQuantity!: number;

    @ManyToOne(() => Item, { nullable: true })
    item?: Item;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
