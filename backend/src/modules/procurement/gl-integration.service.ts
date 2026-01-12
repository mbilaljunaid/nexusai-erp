import { Injectable, BadRequestException } from '@nestjs/common';
import { BudgetService } from '../epm/budget.service';

@Injectable()
export class GlIntegrationService {
    constructor(private readonly budgetService: BudgetService) { }

    async checkFunds(amount: number, departmentId: string): Promise<void> {
        const currentYear = new Date().getFullYear();
        const hasFunds = await this.budgetService.checkFunds(departmentId, amount, currentYear);

        if (!hasFunds) {
            throw new BadRequestException(`Insufficient Funds: Department ${departmentId} does not have enough budget for this request (${amount}).`);
        }
    }

    async reserveFunds(amount: number, departmentId: string): Promise<void> {
        const currentYear = new Date().getFullYear();
        await this.budgetService.reserveFunds(departmentId, amount, currentYear);
    }

    async releaseFunds(amount: number, departmentId: string): Promise<void> {
        const currentYear = new Date().getFullYear();
        await this.budgetService.releaseFunds(departmentId, amount, currentYear);
    }
}
