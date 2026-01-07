
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('epm_forecasts')
export class ForecastEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tenantId: string;

    @Column()
    scenarioName: string; // e.g., "Q1 Optimistic"

    @Column('simple-json')
    data: Record<string, number>; // e.g., { "revenue": 100000, "cogs": 40000 }

    @Column()
    status: 'DRAFT' | 'APPROVED' | 'ARCHIVED';

    @CreateDateColumn()
    createdAt: Date;
}
