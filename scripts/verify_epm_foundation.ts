
import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service';
import { EPMModule } from '../backend/src/modules/epm/epm.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env', // relative to cwd (root)
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432') || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'nexusai',
            autoLoadEntities: true,
            synchronize: false, // Don't sync in verify step
        }),
        EPMModule,
    ],
})
class VerifyModule { }

async function verify() {
    const logger = new Logger('VerifyEPM');
    const app = await NestFactory.createApplicationContext(VerifyModule);

    try {
        const epmFoundation = app.get(EPMFoundationService);

        logger.log('--- Verifying EPM Foundation ---');

        // 1. Check Scenarios
        const scenarios = await epmFoundation.getScenarios();
        logger.log(`Found ${scenarios.length} Scenarios: ${scenarios.map(s => s.code).join(', ')}`);
        if (scenarios.length < 3) throw new Error('Missing Scenarios');

        // 2. Check Versions for Budget
        const budgetVersions = await epmFoundation.getVersions('BUDGET');
        logger.log(`Found ${budgetVersions.length} Budget Versions: ${budgetVersions.map(v => v.code).join(', ')}`);
        if (budgetVersions.length < 2) throw new Error('Missing Budget Versions');

        logger.log('--- Verification SUCCESS ---');
    } catch (error: any) {
        logger.error('Verification Failed', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

verify();
