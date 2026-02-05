
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

import { ProjectFinanceService } from './project-finance.service';
import { PlanProduct } from './entities/plan-product.entity'; // NEW
import { DemandPlanningService } from './demand-planning.service';
import { PredictiveForecastingService } from './predictive-forecasting.service';
import { EpmSecurityService } from './epm-security.service';
import { PlanEsgMetric } from './entities/plan-esg-metric.entity'; // NEW
import { EsgPlanningService } from './esg-planning.service'; // NEW
import { TreasuryPlanningService } from './treasury-planning.service'; // NEW
import { Project } from '../projects/entities/project.entity';
import { ProjectIntegrationService } from './project-integration.service';

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
      PlanProject,
      PlanChannel,
      PlanProduct,
      PlanEsgMetric, // NEW
      EpmAudit,
      GLBalance,
      Project
    ])
  ],
  controllers: [BudgetController, PlanningController],
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
    FormulaService,
    ProjectIntegrationService,
    ProjectFinanceService,
    DemandPlanningService,
    PredictiveForecastingService,
    EpmSecurityService,
    EsgPlanningService, // NEW
    TreasuryPlanningService // NEW
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
    FormulaService,
    ProjectIntegrationService,
    ProjectFinanceService,
    DemandPlanningService,
    PredictiveForecastingService,
    EpmSecurityService,
    EsgPlanningService, // NEW
    TreasuryPlanningService // NEW
  ],
})
export class EPMModule { }
