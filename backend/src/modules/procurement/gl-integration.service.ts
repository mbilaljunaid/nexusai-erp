import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BudgetService } from '../epm/budget.service';

@Injectable()
export class ProcurementGlIntegrationService implements OnModuleInit {
    private budgetService: BudgetService;

    constructor(private moduleRef: ModuleRef) { }

    onModuleInit() {
        this.budgetService = this.moduleRef.get(BudgetService, { strict: false });
    }

    async checkFunds(amount: number, departmentId: string): Promise<void> {
        if (!this.budgetService) return;
        const currentYear = new Date().getFullYear();
        const hasFunds = await this.budgetService.checkFunds(departmentId, amount, currentYear);

        if (!hasFunds) {
            throw new BadRequestException(`Insufficient Funds: Department ${departmentId} does not have enough budget for this request (${amount}).`);
        }
    }

    async reserveFunds(amount: number, departmentId: string): Promise<void> {
        if (!this.budgetService) return;
        const currentYear = new Date().getFullYear();
        await this.budgetService.reserveFunds(departmentId, amount, currentYear);
    }

    async releaseFunds(amount: number, departmentId: string): Promise<void> {
        if (!this.budgetService) return;
        const currentYear = new Date().getFullYear();
        await this.budgetService.releaseFunds(departmentId, amount, currentYear);
    }

    async postJournal(entry: any): Promise<void> {
        // Simulation of posting to GL Integration table or External GL
        console.log("GL_JOURNAL_POSTED:", JSON.stringify(entry));
        // In a real system, this would insert into `gl_interface` table
    }
}
