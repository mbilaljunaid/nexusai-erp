import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EPMService } from './epm.service';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PlanningController } from './planning.controller';
import { Budget } from './entities/budget.entity';
import { PlanScenario } from './entities/plan-scenario.entity';
import { PlanVersion } from './entities/plan-version.entity';
import { PlanDimension } from './entities/plan-dimension.entity';
import { PlanUnit } from './entities/plan-unit.entity';
import { PlanDriver } from './entities/plan-driver.entity';
import { PlanPosition } from './entities/plan-position.entity';
import { PlanAsset } from './entities/plan-asset.entity';
import { PlanProject } from './entities/plan-project.entity';
import { ProjectsModule } from '../projects/projects.module';
import { PlanChannel } from './entities/plan-channel.entity';
import { EpmAudit } from './entities/epm-audit.entity';
import { GLBalance } from '../finance/entities/gl-balance.entity';
import { EPMFoundationService } from './epm-foundation.service';
import { EpmGLIntegrationService } from './gl-integration.service';
import { EpmPlanningService } from './planning.service';
import { DriverService } from './driver.service';
import { WorkforceService } from './workforce.service';
import { CapExService } from './capex.service';
import { EliminationService } from './elimination.service';
import { BudgetControlService } from './budget-control.service';
import { FormulaService } from './formula.service';
import { PlanUnitSubscriber } from './subscribers/plan-unit.subscriber';
import { ProjectFinanceService } from './project-finance.service';
import { PlanProduct } from './entities/plan-product.entity';
import { DemandPlanningService } from './demand-planning.service';
import { PredictiveForecastingService } from './predictive-forecasting.service';
import { EpmSecurityService } from './epm-security.service';
import { PlanEsgMetric } from './entities/plan-esg-metric.entity';
import { EsgPlanningService } from './esg-planning.service';
import { TreasuryPlanningService } from './treasury-planning.service';
import { Project } from '../projects/entities/project.entity';
import { ProjectIntegrationService } from './project-integration.service';
import { FinanceModule } from '../finance/finance.module';
import { ProcurementModule } from '../procurement/procurement.module';

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
      PlanEsgMetric,
      EpmAudit,
    ]),
    ProjectsModule,
    // ProcurementModule removed to break circular dependency (EPM doesn't use it)
    FinanceModule
  ],
  controllers: [
    BudgetController,
    // PlanningController
  ],
  providers: [
    EPMService,
    BudgetService,
    EpmPlanningService,
    EPMFoundationService,
    EpmGLIntegrationService,
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
    EsgPlanningService,
    TreasuryPlanningService
  ],
  exports: [
    EPMService,
    BudgetService,
    EPMService,
    BudgetService,
    EpmPlanningService,
    EPMFoundationService,
    EpmGLIntegrationService,
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
    EsgPlanningService,
    TreasuryPlanningService,
    TypeOrmModule
  ],
})
export class EPMModule { }
