import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GLEntry } from './entities/gl-entry.entity';
import { Invoice } from './entities/invoice.entity';
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
    TaxReportingService
  ],
  controllers: [
    ARTaxController,
    InventoryTaxController,
    IntercompanyTaxController,
    TaxReportingController
  ],
  exports: [TaxEngineService, TaxOverrideService, IntercompanyTaxService, TaxReportingService],
})
export class ERPModule { }
