import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Budget } from './entities/budget.entity';

@Controller('api/epm/budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto): Promise<Budget> {
    return this.budgetService.create(createBudgetDto);
  }

  @Get()
  findAll(): Promise<Budget[]> {
    return this.budgetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Budget | null> {
    return this.budgetService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateBudgetDto>,
  ): Promise<Budget | null> {
    return this.budgetService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.budgetService.remove(id);
  }
}
