import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

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

  async update(id: string, updateData: Partial<CreateBudgetDto>): Promise<Budget | null> {
    await this.budgetRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}
