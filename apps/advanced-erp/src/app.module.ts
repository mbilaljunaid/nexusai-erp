import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpmModule } from './modules/epm/epm.module';
import { ForecastEntity } from './modules/epm/forecast.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://neondb_owner:npg_6M0btqPoxvTy@ep-purple-recipe-a8596645-pooler.eastus2.azure.neon.tech/neondb?sslmode=require', // Fallback for dev
      entities: [ForecastEntity],
      synchronize: true, // Auto-schema for dev speed (Enterprise rule: disable in prod)
    }),
    EpmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
