
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';
import { GLIntegrationService } from '../backend/src/modules/epm/gl-integration.service';
import { FormulaService } from '../backend/src/modules/epm/formula.service';
import { DataSource } from 'typeorm';
import { GLBalance } from '../backend/src/modules/finance/entities/gl-balance.entity';
import { PlanUnit } from '../backend/src/modules/epm/entities/plan-unit.entity';
import { PlanScenario } from '../backend/src/modules/epm/entities/plan-scenario.entity';
import { PlanVersion } from '../backend/src/modules/epm/entities/plan-version.entity';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const glIntegrationService = app.get(GLIntegrationService);
    const formulaService = app.get(FormulaService);

    const glBalanceRepository = dataSource.getRepository(GLBalance);
    const planUnitRepository = dataSource.getRepository(PlanUnit);
    const scenarioRepository = dataSource.getRepository(PlanScenario);

    console.log('--- EPM Phase 2 Verification ---');

    const testPeriod = '2025-01';
    const testLedger = 'PRIMARY_TEST';

    // 1. Cleanup
    console.log('1. Cleaning up test data...');
    await glBalanceRepository.delete({ ledgerId: testLedger });
    await planUnitRepository.delete({ period: testPeriod });

    const scenario = await scenarioRepository.findOneBy({ code: 'ACTUAL' });
    if (!scenario) {
        console.log('Creating ACTUAL scenario...');
        await scenarioRepository.save({ code: 'ACTUAL', name: 'Actuals' });
    }

    // 2. Seed GL Balance
    console.log('2. Seeding GL Balance...');
    await glBalanceRepository.save({
        ledgerId: testLedger,
        periodName: testPeriod,
        codeCombinationId: 'US-IT-60000',
        currencyCode: 'USD',
        periodNetDr: 15000,
        periodNetCr: 0,
        beginBalance: 0,
        endBalance: 15000
    });

    // 3. Test Integration (Fetch Actuals)
    console.log('3. Running fetchActuals...');
    const seededCount = await glIntegrationService.fetchActuals(testPeriod, testLedger);
    console.log(`   Seeded ${seededCount} units.`);

    if (seededCount !== 1) throw new Error('Integration failed: Expected 1 unit');

    const unit = await planUnitRepository.findOne({ where: { period: testPeriod, accountId: '60000', departmentId: 'IT' } });
    if (!unit) throw new Error('Integration failed: Unit not found');
    if (Number(unit.amount) !== 15000) throw new Error(`Integration failed: Expected amount 15000, got ${unit.amount}`);
    console.log('   Integration Verified!');

    // 4. Test Formula Engine (Driver)
    console.log('4. Testing Formula Engine (Driver)...');
    // Create a plan unit to driver
    const driverVersionId = unit.versionId;
    await formulaService.applyDriverRule(driverVersionId, 'Amount * 1.10', { accountId: '60000' });

    const updatedUnit = await planUnitRepository.findOne({ where: { id: unit.id } });
    // 15000 * 1.10 = 16500
    if (Number(updatedUnit?.amount) !== 16500) throw new Error(`Formula failed: Expected 16500, got ${updatedUnit?.amount}`);
    console.log('   Formula Engine Verified!');

    // 5. Test Allocation
    console.log('5. Testing Allocation...');
    // Spread 100,000 across Sales(0.6) and Mktg(0.4)
    const pool = 100000;
    const weights = { 'SALES': 60, 'MKTG': 40 };

    const allocCount = await formulaService.allocate(pool, weights, driverVersionId, '90000_ALLOC_EXP', testPeriod, 'US');

    if (allocCount !== 2) throw new Error('Allocation failed: Expected 2 units');

    const salesUnit = await planUnitRepository.findOne({ where: { period: testPeriod, accountId: '90000_ALLOC_EXP', departmentId: 'SALES' } });
    if (Number(salesUnit?.amount) !== 60000) throw new Error(`Allocation failed: Sales expected 60000, got ${salesUnit?.amount}`);
    console.log('   Allocation Verified!');

    console.log('--- Verification Complete: SUCCESS ---');
    await app.close();
}

bootstrap().catch(err => {
    console.error('Verification Failed:', err);
    process.exit(1);
});
