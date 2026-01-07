import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrderEntity } from './production_order.entity';

@Injectable()
export class ProductionService {
    constructor(
        @InjectRepository(ProductionOrderEntity)
        private readonly orderRepo: Repository<ProductionOrderEntity>,
    ) { }

    async createOrder(tenantId: string, data: Partial<ProductionOrderEntity>) {
        const newOrder = this.orderRepo.create({
            ...data,
            tenant_id: tenantId,
            status: 'PLANNED',
        });
        return this.orderRepo.save(newOrder);
    }

    async findAll(tenantId: string) {
        return this.orderRepo.find({ where: { tenant_id: tenantId } });
    }

    async getDashboardMetrics(tenantId: string) {
        const total = await this.orderRepo.count({ where: { tenant_id: tenantId } });
        const inProgress = await this.orderRepo.count({ where: { tenant_id: tenantId, status: 'IN_PROGRESS' } });
        return {
            active_orders: total,
            efficiency_rate: 85.5, // Calc from real data later
            quality_score: 98.2,
            in_progress_count: inProgress
        };
    }
}
