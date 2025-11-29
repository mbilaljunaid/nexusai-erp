import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TerritoryManagementService } from './territory-management.service';
import { CPQService } from './cpq.service';

@Controller('api/crm/advanced')
export class CRMAdvancedController {
  constructor(
    private territory: TerritoryManagementService,
    private cpq: CPQService,
  ) {}

  @Post('territory/create')
  createTerritory(@Body() territory: any) {
    return this.territory.createTerritory(territory);
  }

  @Post('territory/assign-account/:territoryId/:accountId')
  assignAccount(@Param('territoryId') territoryId: string, @Param('accountId') accountId: string) {
    return this.territory.assignAccountToTerritory(accountId, territoryId);
  }

  @Get('territory/performance/:territoryId')
  getPerformance(@Param('territoryId') territoryId: string) {
    return this.territory.getPerformance(territoryId);
  }

  @Post('cpq/create-quote/:accountId')
  createQuote(@Param('accountId') accountId: string) {
    return this.cpq.createQuote(accountId);
  }

  @Post('cpq/add-line-item/:quoteId')
  addLineItem(@Param('quoteId') quoteId: string, @Body() data: any) {
    return this.cpq.addLineItem(quoteId, data.productId, data.quantity, data.discount);
  }

  @Post('cpq/send/:quoteId')
  sendQuote(@Param('quoteId') quoteId: string) {
    return this.cpq.sendQuote(quoteId);
  }

  @Post('cpq/accept/:quoteId')
  acceptQuote(@Param('quoteId') quoteId: string) {
    return this.cpq.acceptQuote(quoteId);
  }
}
