
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
            synchronize: process.env.NODE_ENV !== 'production',
        }),
        EPMModule,
    ],
})
class SeedModule { }

async function bootstrap() {
    const logger = new Logger('SeedEPMFoundation');
    // Create context using the minimal SeedModule
    const app = await NestFactory.createApplicationContext(SeedModule);

    try {
        const epmFoundation = app.get(EPMFoundationService);

        logger.log('Starting EPM Foundation Seeding...');

        // 1. Ensure Scenarios (Actual, Budget, Forecast)
        await epmFoundation.ensureFoundation();

        // 2. Ensure Standard Versions
        try {
            await epmFoundation.createVersion('Working', 'WORKING', 'ACTUAL', false);
        } catch (e: any) { logger.warn(`Skipping ACTUAL/WORKING: ${e.message}`); }

        try {
            await epmFoundation.createVersion('V1 Draft', 'V1', 'BUDGET', false);
        } catch (e: any) { logger.warn(`Skipping BUDGET/V1: ${e.message}`); }

        try {
            await epmFoundation.createVersion('Final Approved', 'FINAL', 'BUDGET', true);
        } catch (e: any) { logger.warn(`Skipping BUDGET/FINAL: ${e.message}`); }

        try {
            await epmFoundation.createVersion('Q1 Forecast', 'Q1', 'FORECAST', false);
        } catch (e: any) { logger.warn(`Skipping FORECAST/Q1: ${e.message}`); }

        logger.log('EPM Foundation Seeding Complete.');
    } catch (error: any) {
        logger.error('Seeding Failed', error);
    } finally {
        await app.close();
    }
}

bootstrap();
