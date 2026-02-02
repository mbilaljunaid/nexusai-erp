import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
  private expenses: Expense[] = [];
  private idCounter = 1;

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense: Expense = {
      id: this.idCounter++,
      ...createExpenseDto,
      createdAt: new Date(),
    };
    this.expenses.push(expense);
    return expense;
  }

  async findAll(): Promise<Expense[]> {
    return this.expenses;
  }

  async findOne(id: string): Promise<Expense | null> {
    return this.expenses.find(e => e.id === parseInt(id)) || null;
  }

  async update(id: string, updateExpenseDto: Partial<CreateExpenseDto>): Promise<Expense | null> {
    const expense = this.expenses.find(e => e.id === parseInt(id));
    if (!expense) return null;
    Object.assign(expense, updateExpenseDto);
    return expense;
  }

  async remove(id: string): Promise<void> {
    const index = this.expenses.findIndex(e => e.id === parseInt(id));
    if (index > -1) this.expenses.splice(index, 1);
  }
}
