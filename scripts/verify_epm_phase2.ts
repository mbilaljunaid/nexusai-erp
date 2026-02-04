
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service';
import { GLIntegrationService } from '../backend/src/modules/epm/gl-integration.service';
import { PlanningService } from '../backend/src/modules/epm/planning.service';
import { DriverService } from '../backend/src/modules/epm/driver.service';
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
class VerifyPhase2Module { }

async function verify() {
    const logger = new Logger('VerifyEPM_Phase2');
    const app = await NestFactory.createApplicationContext(VerifyPhase2Module);

    try {
        const glService = app.get(GLIntegrationService);
        const planningService = app.get(PlanningService);
        const driverService = app.get(DriverService);
        const foundation = app.get(EPMFoundationService);

        logger.log('--- Verifying Phase 2: Core Financials ---');

        // 1. Fetch Actuals from GL
        const actualsCount = await glService.fetchActuals('2024-01');
        logger.log(`Fetched ${actualsCount} Actuals records`);
        if (actualsCount === 0) throw new Error('Failed to fetch actuals');

        // 2. Create Drivers
        await driverService.createDriver('CPI_2024', 'Inflation 2024', 0.05);
        logger.log('Created Driver: CPI_2024 at 5%');

        // 3. Create Budget Version (if not exists)
        // We expect 'V1' from Phase 1 seeding, but let's ensure 'BUDGET_2024_V2' for testing
        const budgetScenario = (await foundation.getScenarios()).find(s => s.code === 'BUDGET');
        const actualScenario = (await foundation.getScenarios()).find(s => s.code === 'ACTUAL');

        // Get source Version (Working Actuals)
        const actualVersion = (await foundation.getVersions('ACTUAL')).find(v => v.code === 'WORKING');
        if (!actualVersion) throw new Error('Missing Actuals Working Version');

        // Create Target Version
        let budgetVersion = (await foundation.getVersions('BUDGET')).find(v => v.code === 'V2_TEST');
        if (!budgetVersion) {
            budgetVersion = await foundation.createVersion('V2 Test', 'V2_TEST', 'BUDGET', false);
        }

        // 4. Generate Base Plan (Copy Actuals -> Budget V2)
        const copied = await planningService.generateBasePlan(actualVersion.id, budgetVersion.id, 'COPY');
        logger.log(`Copied ${copied} records to Budget V2`);
        if (copied === 0) throw new Error('Copy Base Plan Failed');

        // 5. Apply Driver (Inflation +5%)
        const updated = await planningService.applyDriver(budgetVersion.id, 'CPI_2024', 0.05);
        logger.log(`Applied Driver to ${updated} records`);

        logger.log('--- Verification Phase 2 SUCCESS ---');
    } catch (error: any) {
        logger.error('Verification Failed', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verify();
