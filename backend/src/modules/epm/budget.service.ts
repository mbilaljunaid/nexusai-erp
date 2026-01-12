import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) { }

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create(createBudgetDto);
    return this.budgetRepository.save(budget);
  }

  async findAll(): Promise<Budget[]> {
    return this.budgetRepository.find();
  }

  async findOne(id: string): Promise<Budget | null> {
    return this.budgetRepository.findOneBy({ id });
  }

  // Enhanced Logic for Fund Checking
  async checkFunds(departmentId: string, amount: number, year: number): Promise<boolean> {
    // Simplifying: Sum all quarters for the year or find matching quarter. Assuming annual check for MVP.
    const budgets = await this.budgetRepository.find({ where: { departmentId, year } });
    if (!budgets.length) {
      this.logger.warn(`No budget found for Dept ${departmentId} Year ${year}`);
      return false; // Fail safe
    }

    const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0);
    const totalUsed = budgets.reduce((sum, b) => sum + Number(b.spentAmount) + Number(b.reservedAmount), 0);

    const available = totalAllocated - totalUsed;
    this.logger.log(`Funds Check Dept ${departmentId}: Req=${amount}, Avail=${available}`);

    return available >= amount;
  }

  async reserveFunds(departmentId: string, amount: number, year: number): Promise<void> {
    // Simplistic allocation to first available budget bucket
    const budgets = await this.budgetRepository.find({ where: { departmentId, year } });
    if (!budgets.length) return;

    const budget = budgets[0]; // Logic could be smarter to pick current quarter
    budget.reservedAmount = Number(budget.reservedAmount) + Number(amount);
    await this.budgetRepository.save(budget);
    this.logger.log(`Reserved ${amount} for Dept ${departmentId}`);
  }

  async releaseFunds(departmentId: string, amount: number, year: number): Promise<void> {
    const budgets = await this.budgetRepository.find({ where: { departmentId, year } });
    if (!budgets.length) return;

    const budget = budgets[0];
    budget.reservedAmount = Math.max(0, Number(budget.reservedAmount) - Number(amount));
    await this.budgetRepository.save(budget);
  }

  async update(id: string, updateData: Partial<CreateBudgetDto>): Promise<Budget | null> {
    await this.budgetRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}
