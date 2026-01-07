import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from './vehicle.entity';

@Injectable()
export class FleetService {
    constructor(
        @InjectRepository(VehicleEntity)
        private readonly repo: Repository<VehicleEntity>,
    ) { }

    async findAll(tenantId: string) {
        return this.repo.find({ where: { tenant_id: tenantId } });
    }

    async createVehicle(tenantId: string, data: Partial<VehicleEntity>) {
        return this.repo.save({ ...data, tenant_id: tenantId });
    }

    // AI-Driven Optimization (Mock Algo)
    async dispatchOptimized(tenantId: string, location: string) {
        // 1. Find nearest available vehicle
        const available = await this.repo.findOne({
            where: { tenant_id: tenantId, status: 'AVAILABLE' }
        });

        if (!available) throw new Error("No vehicles available for dispatch");

        // 2. Assign (Mock)
        available.status = 'IN_TRANSIT';
        await this.repo.save(available);

        return {
            dispatch_id: crypto.randomUUID(),
            vehicle: available,
            estimated_arrival: '2h 15m'
        };
    }
}
