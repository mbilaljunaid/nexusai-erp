
import { Module } from '@nestjs/common';
import { GLEntryService } from './gl-entry.service';
import { GLEntryController } from './gl-entry.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { ARTaxService } from './ar-tax.service';
import { ARTaxController } from './ar-tax.controller';
import { InventoryTaxService } from './inventory-tax.service';
import { InventoryTaxController } from './inventory-tax.controller';
import { TaxPeriodCloseService } from './tax-period-close.service';
import { TaxFilingScheduler } from './tax-filing.scheduler';
import { TaxOverrideService } from './tax-override.service';
import { AuditModule } from '../audit/audit.module';
import { IntercompanyTaxService } from './intercompany-tax.service';
import { IntercompanyTaxController } from './intercompany-tax.controller';
import { TaxReportingService } from './tax-reporting.service';
import { TaxReportingController } from './tax-reporting.controller';
import { TaxEngineService } from './tax-engine.service';
import { ArService } from './ar.service';
import { ArController } from './ar.controller';
import { InvoiceGlService } from './invoice-gl.service';
import { InvoiceGlController } from './invoice-gl.controller';
import { InvoiceApprovalService } from './invoice-approval.service';
import { InvoiceApprovalController } from './invoice-approval.controller';
import { RevenueEngineService } from './revenue-engine.service';
import { RevenueEngineController } from './revenue-engine.controller';
import { RevenueEngineExtensionService } from './revenue-engine-extension.service';
import { IntercompanyDisputeService } from './intercompany-dispute.service';

@Module({
  imports: [AuditModule],
  providers: [
    TaxEngineService,
    ARTaxService,
    InventoryTaxService,
    TaxPeriodCloseService,
    TaxFilingScheduler,
    TaxOverrideService,
    IntercompanyTaxService,
    TaxReportingService,
    ArService,
    InvoiceGlService,
    InvoiceApprovalService,
    RevenueEngineService,
    RevenueEngineExtensionService,
    IntercompanyDisputeService,
  ],
  controllers: [
    ARTaxController,
    InventoryTaxController,
    IntercompanyTaxController,
    TaxReportingController,
    ArController,
    InvoiceGlController,
    InvoiceApprovalController,
    RevenueEngineController,
  ],
  exports: [TaxEngineService, TaxOverrideService, IntercompanyTaxService, TaxReportingService, ArService, InvoiceGlService, InvoiceApprovalService, RevenueEngineService, RevenueEngineExtensionService, IntercompanyDisputeService],
})
export class ERPModule { }
