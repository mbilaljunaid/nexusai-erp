import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseReport, InsertExpenseReport, InsertExpenseLine } from '@shared/schema';

@Controller('api/expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) { }

  @Get('reports')
  async findAllReports(): Promise<any[]> {
    return this.expenseService.findAllReports();
  }

  @Get('items')
  async findAllLines(): Promise<any[]> {
    return this.expenseService.findAllLines();
  }

  @Post('items/validate')
  async validateLine(@Body() data: any): Promise<any> {
    return this.expenseService.validateLine(data);
  }

  @Post('reports')
  async createReport(@Body() data: any): Promise<any> {
    return this.expenseService.createReport(data);
  }

  @Patch('reports/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('userId') userId: string
  ): Promise<any> {
    return this.expenseService.updateStatus(id, status, userId);
  }

  @Get('reports/:id')
  async findOneReport(@Param('id') id: string): Promise<any | null> {
    return this.expenseService.getReport(id);
  }

  @Post('items')
  async createLine(@Body() data: any): Promise<any> {
    return this.expenseService.createLine(data);
  }

  @Post('items/extract')
  async extractReceipt(@Body() body: any) {
    return await this.expenseService.extractReceipt(body);
  }

  @Get('cards/transactions')
  async getCardTransactions(@Query('userId') userId: string) {
    return await this.expenseService.getCardTransactions(userId);
  }

  @Post('cards/import')
  async importCardTransactions(@Body('userId') userId: string) {
    return await this.expenseService.importCardTransactions(userId);
  }

  @Delete('reports/:id')
  async removeReport(@Param('id') id: string): Promise<void> {
    return this.expenseService.removeReport(id);
  }

  @Post('reports/:id/post-gl')
  async postToGL(@Param('id') id: string): Promise<any> {
    return this.expenseService.postToGL(id);
  }
}
