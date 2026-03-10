import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

  async create(createBudgetDto: CreateBudgetDto) {
    const [budget] = await this.db.insert(schema.budgets).values({
      departmentId: createBudgetDto.departmentId,
      year: createBudgetDto.year,
      quarter: createBudgetDto.quarter,
      allocatedAmount: String(createBudgetDto.allocatedAmount),
      spentAmount: '0',
      reservedAmount: '0',
      status: createBudgetDto.status || 'draft',
      notes: createBudgetDto.notes,
    }).returning();
    return budget;
  }

  async findAll() {
    return this.db.query.budgets.findMany();
  }

  async findOne(id: string) {
    const budget = await this.db.query.budgets.findFirst({
      where: eq(schema.budgets.id, id),
    });
    return budget || null;
  }

  // Enhanced Logic for Fund Checking
  async checkFunds(departmentId: string, amount: number, year: number): Promise<boolean> {
    // Simplifying: Sum all quarters for the year or find matching quarter. Assuming annual check for MVP.
    const budgets = await this.db.query.budgets.findMany({
      where: and(
        eq(schema.budgets.departmentId, departmentId),
        eq(schema.budgets.year, year)
      )
    });

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
    const budgets = await this.db.query.budgets.findMany({
      where: and(
        eq(schema.budgets.departmentId, departmentId),
        eq(schema.budgets.year, year)
      )
    });

    if (!budgets.length) return;

    const budget = budgets[0]; // Logic could be smarter to pick current quarter

    await this.db.update(schema.budgets)
      .set({ reservedAmount: String(Number(budget.reservedAmount) + Number(amount)) })
      .where(eq(schema.budgets.id, budget.id));

    this.logger.log(`Reserved ${amount} for Dept ${departmentId}`);
  }

  async releaseFunds(departmentId: string, amount: number, year: number): Promise<void> {
    const budgets = await this.db.query.budgets.findMany({
      where: and(
        eq(schema.budgets.departmentId, departmentId),
        eq(schema.budgets.year, year)
      )
    });
    if (!budgets.length) return;

    const budget = budgets[0];
    const newReserved = Math.max(0, Number(budget.reservedAmount) - Number(amount));

    await this.db.update(schema.budgets)
      .set({ reservedAmount: String(newReserved) })
      .where(eq(schema.budgets.id, budget.id));
  }

  async update(id: string, updateData: Partial<CreateBudgetDto>) {
    const [updated] = await this.db.update(schema.budgets)
      .set({
        ...updateData,
        allocatedAmount: updateData.allocatedAmount ? String(updateData.allocatedAmount) : undefined
      })
      .where(eq(schema.budgets.id, id))
      .returning();
    return updated || null;
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(schema.budgets).where(eq(schema.budgets.id, id));
  }
}
