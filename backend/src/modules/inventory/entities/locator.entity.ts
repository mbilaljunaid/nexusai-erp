import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subinventory } from './subinventory.entity';

@Entity('inv_locators')
export class Locator {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Subinventory)
    subinventory!: Subinventory;

    @Column({ type: 'varchar' })
    code!: string; // Combined (e.g. 1.1.1) or Row/Rack/Bin

    @Column({ type: 'varchar', nullable: true })
    row?: string;

    @Column({ type: 'varchar', nullable: true })
    rack?: string;

    @Column({ type: 'varchar', nullable: true })
    bin?: string;

    @Column({ type: 'boolean', default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
