import { Module } from '@nestjs/common';
import { EPMService } from './epm.service';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { PlanningController } from './planning.controller';
import { ProjectsModule } from '../projects/projects.module';
import { EPMFoundationService } from './epm-foundation.service';
import { EpmGLIntegrationService } from './gl-integration.service';
import { EpmPlanningService } from './planning.service';
import { DriverService } from './driver.service';
import { WorkforceService } from './workforce.service';
import { CapExService } from './capex.service';
import { EliminationService } from './elimination.service';
import { BudgetControlService } from './budget-control.service';
import { FormulaService } from './formula.service';
// import { PlanUnitSubscriber } from './subscribers/plan-unit.subscriber';
import { ProjectFinanceService } from './project-finance.service';
import { DemandPlanningService } from './demand-planning.service';
import { PredictiveForecastingService } from './predictive-forecasting.service';
import { EpmSecurityService } from './epm-security.service';
import { EsgPlanningService } from './esg-planning.service';
import { TreasuryPlanningService } from './treasury-planning.service';
import { ProjectIntegrationService } from './project-integration.service';
import { FinanceModule } from '../finance/finance.module';
import { ProcurementModule } from '../procurement/procurement.module';

@Module({
  imports: [
    ProjectsModule,
    // ProcurementModule, // Commented out to break circular dependency
    FinanceModule
  ],
  controllers: [
    BudgetController,
    PlanningController
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
    // PlanUnitSubscriber,
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
    TreasuryPlanningService
  ],
})
export class EPMModule { }
