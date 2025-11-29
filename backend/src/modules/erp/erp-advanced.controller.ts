import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BankReconciliationService } from './bank-reconciliation.service';
import { MultiEntityService } from './multi-entity.service';
import { TaxEngineService } from './tax-engine.service';

@Controller('api/erp/advanced')
export class ERPAdvancedController {
  constructor(
    private bankRecon: BankReconciliationService,
    private multiEntity: MultiEntityService,
    private taxEngine: TaxEngineService,
  ) {}

  @Post('bank-reconciliation/add-transaction')
  addBankTransaction(@Body() data: any) {
    return this.bankRecon.addBankTransaction(data);
  }

  @Post('bank-reconciliation/reconcile')
  reconcile() {
    return this.bankRecon.reconcile();
  }

  @Post('bank-reconciliation/auto-reconcile')
  autoReconcile() {
    return this.bankRecon.autoReconcile();
  }

  @Post('multi-entity/create')
  createEntity(@Body() entity: any) {
    return this.multiEntity.createEntity(entity);
  }

  @Post('multi-entity/consolidate/:parentEntityId')
  consolidate(@Param('parentEntityId') parentEntityId: string) {
    return this.multiEntity.consolidate(parentEntityId);
  }

  @Post('tax-engine/calculate')
  calculateTax(@Body() transaction: any) {
    return this.taxEngine.calculateTax(transaction);
  }

  @Get('tax-engine/obligations/:jurisdiction')
  getTaxObligations(@Param('jurisdiction') jurisdiction: string) {
    return this.taxEngine.calculateTaxObligations(jurisdiction, {
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(),
    });
  }
}
