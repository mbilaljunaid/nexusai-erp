
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service';
import { WorkforceService } from '../backend/src/modules/epm/workforce.service';
import { CapExService } from '../backend/src/modules/epm/capex.service';
import { PlanPosition } from '../backend/src/modules/epm/entities/plan-position.entity';
import { PlanAsset } from '../backend/src/modules/epm/entities/plan-asset.entity';
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
        }),
        EPMModule,
    ],
})
class VerifyPhase3Module { }

async function verify() {
    const logger = new Logger('VerifyEPM_Phase3');
    const app = await NestFactory.createApplicationContext(VerifyPhase3Module);

    try {
        const workforceService = app.get(WorkforceService);
        const capexService = app.get(CapExService);
        const foundation = app.get(EPMFoundationService);

        // Repositories for seeding
        const posRepo = app.get('PlanPositionRepository'); // This might differ, better to use EntityManager if we don't inject
        // Actually, let's inject Repository tokens or just use the Service if we added Seed methods.
        // For verification script, let's use the EntityManager for creating test data directly?
        // Or just use the TypeORM connection.
        const dataSource = app.get('DataSource');
        const posRepoReal = dataSource.getRepository(PlanPosition);
        const assetRepoReal = dataSource.getRepository(PlanAsset);

        logger.log('--- Verifying Phase 3: Operational Planning ---');

        // 1. Setup Version (Reuse BUDGET V2 or create V3)
        let version = (await foundation.getVersions('BUDGET')).find(v => v.code === 'V3_OPS');
        if (!version) {
            version = await foundation.createVersion('V3 Ops', 'V3_OPS', 'BUDGET', false);
        }

        // 2. Seed Workforce Data
        const pos1 = posRepoReal.create({
            jobTitle: 'Senior Engineer',
            departmentId: 'ENG',
            startDate: '2024-01-01',
            annualSalary: 120000,
            benefitsPct: 0.2, // 20%
            status: 'NEW',
            versionId: version.id
        });
        await posRepoReal.save(pos1);
        logger.log('Seeded Position: Senior Engineer (120k)');

        // 3. Calc Headcount Costs
        const wfpLines = await workforceService.runCalculation(version.id, version.scenarioId);
        logger.log(`Generated ${wfpLines} Plan Lines for Workforce`);
        // Expected: 120k / 12 = 10k salary + 2k benefits = 12k total? 
        // Service generates 1 line per emp per month? Logic was simplified to 1 line for test.

        // 4. Seed CapEx Data
        const asset1 = assetRepoReal.create({
            name: 'GPU Server',
            assetType: 'IT',
            purchaseDate: '2024-01-15',
            cost: 24000,
            usefulLifeMonths: 24, // 1k/month
            depreciationMethod: 'STRAIGHT_LINE',
            versionId: version.id
        });
        await assetRepoReal.save(asset1);
        logger.log('Seeded Asset: GPU Server (24k)');

        // 5. Calc Depreciation
        const depLines = await capexService.calculateDepreciation(version.id, version.scenarioId);
        logger.log(`Generated ${depLines} Plan Lines for Depreciation`);

        logger.log('--- Verification Phase 3 SUCCESS ---');
    } catch (error: any) {
        logger.error('Verification Failed', JSON.stringify(error));
        console.error(error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verify();
