
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PlanUnit } from '../entities/plan-unit.entity';
import { EpmAudit } from '../entities/epm-audit.entity';

import { OnModuleInit, Injectable } from '@nestjs/common';

@Injectable()
export class PlanUnitSubscriber implements EntitySubscriberInterface<PlanUnit>, OnModuleInit {

    constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

    onModuleInit() {
        // this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return PlanUnit;
    }

    async afterUpdate(event: UpdateEvent<PlanUnit>) {
        if (!event.entity) return;

        const oldAmount = event.databaseEntity.amount;
        const newAmount = event.entity.amount;

        if (oldAmount !== newAmount) {
            const auditRepo = event.manager.getRepository(EpmAudit);
            const log = auditRepo.create({
                planUnitId: event.entity.id,
                oldValue: Number(oldAmount),
                newValue: Number(newAmount),
                changeType: 'UPDATE', // Could be enriched with 'API' context if using AsyncLocalStorage
                userId: 'SYSTEM', // Placeholder until Request Context is available
            });
            await auditRepo.save(log);
        }
    }
}
