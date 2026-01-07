import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpmController } from './epm.controller';
import { EpmService } from './epm.service';
import { ForecastEntity } from './forecast.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ForecastEntity])],
    controllers: [EpmController],
    providers: [EpmService],
})
export class EpmModule { }
