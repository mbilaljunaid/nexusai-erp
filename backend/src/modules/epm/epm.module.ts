
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EPMService } from './epm.service';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PlanningController } from './planning.controller'; // NEW
import { Budget } from './entities/budget.entity';
import { PlanScenario } from './entities/plan-scenario.entity';
import { PlanVersion } from './entities/plan-version.entity';
import { PlanDimension } from './entities/plan-dimension.entity';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanDriver } from './entities/plan-driver.entity';
import { PlanPosition } from './entities/plan-position.entity';
import { PlanAsset } from './entities/plan-asset.entity';
import { PlanProject } from './entities/plan-project.entity'; // NEW
import { PlanChannel } from './entities/plan-channel.entity'; // NEW
import { EpmAudit } from './entities/epm-audit.entity';
import { GLBalance } from '../finance/entities/gl-balance.entity'; // NEW
import { EPMFoundationService } from './epm-foundation.service';
import { GLIntegrationService } from './gl-integration.service';
import { PlanningService } from './planning.service';
import { DriverService } from './driver.service';
import { WorkforceService } from './workforce.service';
import { CapExService } from './capex.service';
import { EliminationService } from './elimination.service';
import { BudgetControlService } from './budget-control.service';
import { FormulaService } from './formula.service'; // NEW
import { PlanUnitSubscriber } from './subscribers/plan-unit.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Budget,
      PlanScenario,
      PlanVersion,
      PlanDimension,
      PlanUnit,
      PlanDriver,
      PlanPosition,
      PlanAsset,
      PlanProject, // NEW
      PlanChannel, // NEW
      EpmAudit,
      GLBalance // NEW
    ])
  ],
  controllers: [BudgetController, PlanningController], // Updated
  providers: [
    EPMService,
    BudgetService,
    EPMFoundationService,
    GLIntegrationService,
    PlanningService,
    DriverService,
    WorkforceService,
    CapExService,
    EliminationService,
    BudgetControlService,
    PlanUnitSubscriber,
    FormulaService // NEW
  ],
  exports: [
    EPMService,
    BudgetService,
    EPMFoundationService,
    GLIntegrationService,
    PlanningService,
    DriverService,
    WorkforceService,
    CapExService,
    EliminationService,
    BudgetControlService,
    FormulaService // NEW
  ],
})
export class EPMModule { }
