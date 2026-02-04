
import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { DriverService } from './driver.service';
import { WorkforceService } from './workforce.service';
import { BudgetControlService } from './budget-control.service';
import { EPMFoundationService } from './epm-foundation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanUnit } from './entities/plan-unit.entity';
import { Repository } from 'typeorm';

@Controller('api/epm')
export class PlanningController {
    private readonly logger = new Logger(PlanningController.name);

    constructor(
        private readonly planningService: PlanningService,
        private readonly driverService: DriverService,
        private readonly workforceService: WorkforceService,
        private readonly controlService: BudgetControlService,
        private readonly foundationService: EPMFoundationService,
        @InjectRepository(PlanUnit)
        private planUnitRepo: Repository<PlanUnit>
    ) { }

    @Get('versions')
    async getVersions(@Query('scenario') scenarioCode: string) {
        if (scenarioCode) {
            return this.foundationService.getVersions(scenarioCode);
        }
        // Return list of all scenarios with versions ? 
        // Simplified: return scenarios with versions included logic is needed in service.
        return this.foundationService.getScenarios();
    }

    @Get('plan-units')
    async getPlanUnits(
        @Query('versionId') versionId: string,
        @Query('entity') entityId?: string
    ) {
        const where: any = { versionId };
        if (entityId) where.entityId = entityId;
        return this.planUnitRepo.find({ where, take: 500 });
    }

    @Post('calculate/driver')
    async applyDriver(
        @Body() body: { versionId: string, driverName: string, value: number }
    ) {
        this.logger.log(`Received Driver Apply Request: ${JSON.stringify(body)}`);
        return this.planningService.applyDriver(body.versionId, body.driverName, body.value);
    }

    @Post('calculate/wfp')
    async runWorkforcePlanning(
        @Body() body: { versionId: string, scenarioId: string }
    ) {
        return this.workforceService.runCalculation(body.versionId, body.scenarioId);
    }

    @Post('publish')
    async publishBudget(@Body() body: { versionId: string }) {
        return this.controlService.publishToGL(body.versionId);
    }
}
