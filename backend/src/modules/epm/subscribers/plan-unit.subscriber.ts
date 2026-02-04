
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent, DataSource } from 'typeorm';
import { PlanUnit } from '../entities/plan-unit.entity';
import { EpmAudit } from '../entities/epm-audit.entity';

@EventSubscriber()
export class PlanUnitSubscriber implements EntitySubscriberInterface<PlanUnit> {

    constructor(dataSource: DataSource) {
        dataSource.subscribers.push(this);
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
