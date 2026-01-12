import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RfqLine } from './rfq-line.entity';
import { SupplierQuote } from './supplier-quote.entity';

@Entity('procure_rfq_headers')
export class RfqHeader {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    rfqNumber!: string;

    @Column()
    title!: string;

    @Column({ default: 'Draft' }) // Draft, Active, Closed, Awarded
    status!: string;

    @Column({ type: 'timestamp', nullable: true })
    deadline?: Date;

    @OneToMany(() => RfqLine, (line) => line.header, { cascade: true })
    lines!: RfqLine[];

    @OneToMany(() => SupplierQuote, (quote) => quote.rfq, { cascade: true })
    quotes!: SupplierQuote[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
