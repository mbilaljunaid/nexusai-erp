import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionModule } from './modules/production/production.module';
import { ProductionOrderEntity } from './modules/production/production_order.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_6M0btqPoxvTy@ep-purple-recipe-a8596645-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
            entities: [ProductionOrderEntity],
            synchronize: false, // Schema managed by script
        }),
        ProductionModule,
    ],
})
export class AppModule { }
