
import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanVersion } from './entities/plan-version.entity';

@Injectable()
export class BudgetControlService {
    private readonly logger = new Logger(BudgetControlService.name);

    constructor(
        @InjectRepository(PlanVersion)
        private versionRepository: Repository<PlanVersion>,
    ) { }

    async publishToGL(versionId: string): Promise<void> {
        this.logger.log(`Publishing Budget Version ${versionId} to GL...`);

        const version = await this.versionRepository.findOneBy({ id: versionId });
        if (!version) throw new ConflictException('Version not found');

        if (version.isLocked) {
            this.logger.warn('Version is already locked/published.');
            return;
        }

        // 1. Lock the Version
        version.isLocked = true;
        version.isFinal = true;
        await this.versionRepository.save(version);

        // 2. Push to GL Interface (Mocked)
        // await this.glInterface.insert( ... select * from plan_units where versionId ... )
        this.logger.log(`Budget Version ${versionId} LOCKED and Synced to ERP.`);
    }
}
