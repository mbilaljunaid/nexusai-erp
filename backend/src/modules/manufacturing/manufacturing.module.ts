import { Module } from '@nestjs/common';
import { ManufacturingVarianceController } from './manufacturing-variance.controller';
import { ManufacturingVarianceService } from './manufacturing-variance.service';

@Module({
    controllers: [ManufacturingVarianceController],
    providers: [ManufacturingVarianceService],
    exports: [ManufacturingVarianceService],
})
export class ManufacturingModule { }
