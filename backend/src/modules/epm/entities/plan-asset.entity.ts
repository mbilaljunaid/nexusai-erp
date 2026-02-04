import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plan_assets')
export class PlanAsset {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string; // e.g., 'New Server Rack'

    @Column()
    assetType!: string; // IT, VEHICLE, FURNITURE

    @Column()
    purchaseDate!: string; // YYYY-MM-DD

    @Column('decimal', { precision: 18, scale: 2 })
    cost!: number;

    @Column({ type: 'int' })
    usefulLifeMonths!: number; // e.g., 36, 60

    @Column({ default: 'STRAIGHT_LINE' })
    depreciationMethod!: string;

    @Column()
    versionId!: string; // Associated plan version

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
