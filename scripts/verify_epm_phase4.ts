
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service';
import { EliminationService } from '../backend/src/modules/epm/elimination.service';
import { BudgetControlService } from '../backend/src/modules/epm/budget-control.service';
import { PlanUnit } from '../backend/src/modules/epm/entities/plan-unit.entity';
import { EpmAudit } from '../backend/src/modules/epm/entities/epm-audit.entity';
import { EPMModule } from '../backend/src/modules/epm/epm.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432') || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'nexusai',
            autoLoadEntities: true,
            synchronize: false,
            subscribers: [] // TypeORM loads subscribers automatically if using autoLoadEntities: true in some versions, but explicit or via Module provider is safer. Let's rely on Module provider.
        }),
        EPMModule,
    ],
})
class VerifyPhase4Module { }

async function verify() {
    const logger = new Logger('VerifyEPM_Phase4');
    const app = await NestFactory.createApplicationContext(VerifyPhase4Module);

    try {
        const eliminationService = app.get(EliminationService);
        const budgetControl = app.get(BudgetControlService);
        const foundation = app.get(EPMFoundationService);
        const dataSource = app.get('DataSource');
        const unitRepo = dataSource.getRepository(PlanUnit);
        const auditRepo = dataSource.getRepository(EpmAudit);

        logger.log('--- Verifying Phase 4: Enterprise Hardening ---');

        // 1. Setup Version (Reuse BUDGET V3 or create V4)
        let version = (await foundation.getVersions('BUDGET')).find(v => v.code === 'V4_FINAL');
        if (!version) {
            version = await foundation.createVersion('V4 Final', 'V4_FINAL', 'BUDGET', false);
        }

        // 2. Seed IC Transaction
        const icUnit = unitRepo.create({
            scenarioId: version.scenarioId,
            versionId: version.id,
            period: '2024-01',
            entityId: 'US-OPS',
            departmentId: 'SALES',
            accountId: 'IC_SALES',
            amount: 5000,
            status: 'DRAFT'
        });
        await unitRepo.save(icUnit);
        logger.log('Seeded IC Sales Record (5000)');

        // 3. Run Eliminations
        const elimCount = await eliminationService.runEliminations(version.id, version.scenarioId);
        logger.log(`Generated ${elimCount} Eliminations`);
        // Verify Audit Log for create? (Only update triggers audit in our simple subscriber, insert might not if not configured)
        // Let's test Update Audit.

        // 4. Test Audit Log (Update the IC Unit)
        icUnit.amount = 6000;
        await unitRepo.save(icUnit);
        logger.log('Updated IC Sales Record to 6000');

        // Check Audit
        const logs = await auditRepo.find({ where: { planUnitId: icUnit.id } });
        if (logs.length > 0) {
            logger.log(`Audit Log Found! Changes: ${logs.length}. Last Change: ${logs[logs.length - 1].oldValue} -> ${logs[logs.length - 1].newValue}`);
        } else {
            logger.warn('No Audit Log found. Check Subscriber registration.');
        }

        // 5. Test Budget Control (Lock)
        await budgetControl.publishToGL(version.id);
        const lockedVersion = (await foundation.getVersions('BUDGET')).find(v => v.id === version!.id);
        if (lockedVersion?.isLocked && lockedVersion?.isFinal) {
            logger.log('Budget Version successfully LOCKED and PUBLISHED.');
        } else {
            throw new Error('Budget Lock Failed');
        }

        logger.log('--- Verification Phase 4 SUCCESS ---');
    } catch (error: any) {
        logger.error('Verification Failed', JSON.stringify(error));
        console.error(error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verify();
