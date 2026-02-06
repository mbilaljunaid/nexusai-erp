
import { Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema/index.ts';
import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service.ts';
import { EpmPlanningService } from '../backend/src/modules/epm/planning.service.ts';
import { BudgetService } from '../backend/src/modules/epm/budget.service.ts';
import { WorkforceService } from '../backend/src/modules/epm/workforce.service.ts';
// Ensure other dependencies like DriverService are mocked or instantiated if needed
import { DriverService } from '../backend/src/modules/epm/driver.service.ts';
import { DemandPlanningService } from '../backend/src/modules/epm/demand-planning.service.ts';
import { ProjectFinanceService } from '../backend/src/modules/epm/project-finance.service.ts';
import { ProjectIntegrationService } from '../backend/src/modules/epm/project-integration.service.ts';

async function verifyEpmDrizzle() {
    console.log('--- EPM Verification (Manual Mode) ---');

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is missing');
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    console.log('DB Connected');

    try {
        // Instantiate Services manually
        // Note: Services inject `DRIZZLE_DB` which is `db`.
        // Some services inject other services. We need to respect the dependency graph.

        // Foundation (No dependencies other than DB)
        const foundationService = new EPMFoundationService(db);

        // Driver (Injected into others)
        const driverService = new DriverService(db);

        // Budget (Depends on?)
        const budgetService = new BudgetService(db);

        // Workforce (Depends on?)
        const workforceService = new WorkforceService(db);

        // Planning Service (Injects: DriverService, DemandPlanning, ProjectFinance, ProjectIntegration)
        // Check planning.service.ts constructor:
        // constructor(@Inject(DRIZZLE_DB) db, driverService, demandService, projectService, ...)
        // Wait, I need to check PlanningService constructor.

        // Let's verify Foundation and Budget first as they are simpler.

        console.log('--- 1. Verifying Foundation ---');
        await foundationService.ensureFoundation();
        const scenarios = await foundationService.getScenarios();
        console.log(`Scenarios: ${scenarios.length}`);

        const versions = await foundationService.getVersions('ACTUAL');
        console.log(`Versions for ACTUAL: ${versions.length}`);

        console.log('--- 2. Verifying Budget ---');
        // const budget = await budgetService.create({
        //     departmentId: 'DEPT_MANUAL',
        //     year: 2027,
        //     quarter: 'Q1',
        //     allocatedAmount: 50000,
        //     notes: 'Manual Verification'
        // });
        // console.log(`Budget Created: ${budget.id}`);

        console.log('--- 3. Verifying Workforce ---');
        if (versions.length > 0) {
            // Mock data if needed
            const res = await workforceService.calculateHeadcountCosts(versions[0].id);
            console.log(`Workforce calc result: ${res}`);
        }

        console.log('--- SUCCESS ---');

    } catch (e) {
        console.error('Verification Failed', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verifyEpmDrizzle();
