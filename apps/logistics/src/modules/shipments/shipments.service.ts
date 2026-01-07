import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentEntity } from './shipments.entity';

@Injectable()
export class ShipmentsService {
    private readonly logger = new Logger(ShipmentsService.name);

    constructor(@InjectRepository(ShipmentEntity) private readonly repo: Repository<ShipmentEntity>) { }

    async create(payload: any): Promise<ShipmentEntity> {
        // Map payload to Entity structure if needed, or assume DTO matches
        const entity = this.repo.create({
            ...payload,
            tenantId: payload.tenantId || 'default-tenant', // Should come from context
            status: 'PLANNED',
        });
        return this.repo.save(entity);
    }

    async findOne(id: string): Promise<ShipmentEntity | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findAll(tenantId: string): Promise<ShipmentEntity[]> {
        return this.repo.find({ where: { tenantId } });
    }

    async updateStatus(id: string, status: string): Promise<ShipmentEntity> {
        await this.repo.update(id, { status });
        return this.repo.findOne({ where: { id } }) as Promise<ShipmentEntity>;
    }

    async predictEta(id: string): Promise<any> {
        const shipment = await this.findOne(id);
        if (!shipment) throw new Error('Shipment not found');

        // CALL AI SERVICE (Mocked HTTP call for now)
        this.logger.log(`Requesting AI ETA prediction for shipment ${id}`);

        // Mock AI Response
        // In real implementation: await http.post('http://ai-service/execute', { action: 'PREDICT_ETA', ... })
        return {
            originalEta: shipment.estimatedArrival,
            predictedEta: new Date(new Date().getTime() + 86400000).toISOString(), // +1 day
            confidence: 0.89,
            reasoning: "Traffic congestion reported on Route I-95."
        };
    }
}
