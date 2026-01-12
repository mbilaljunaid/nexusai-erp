import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Subinventory } from './subinventory.entity';

@Entity('inv_locators')
export class Locator {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Subinventory)
    subinventory!: Subinventory;

    @Column()
    code!: string; // Combined (e.g. 1.1.1) or Row/Rack/Bin

    @Column({ nullable: true })
    row?: string;

    @Column({ nullable: true })
    rack?: string;

    @Column({ nullable: true })
    bin?: string;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
