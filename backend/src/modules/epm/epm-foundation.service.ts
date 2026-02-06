
import { Inject, Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class EPMFoundationService {
    private readonly logger = new Logger(EPMFoundationService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async createScenario(name: string, code: string, isSystem = false) {
        const existing = await this.db.query.planScenarios.findFirst({
            where: eq(schema.planScenarios.code, code)
        });

        if (existing) {
            throw new ConflictException(`Scenario with code ${code} already exists`);
        }

        const [scenario] = await this.db.insert(schema.planScenarios).values({
            name,
            code,
            isSystem, // Drizzle boolean default can handle this, but explicit is fine
        }).returning();

        this.logger.log(`Creating Scenario: ${name} (${code})`);
        return scenario;
    }

    async createVersion(name: string, code: string, scenarioCode: string, isFinal = false) {
        const scenario = await this.db.query.planScenarios.findFirst({
            where: eq(schema.planScenarios.code, scenarioCode)
        });

        if (!scenario) {
            throw new NotFoundException(`Scenario ${scenarioCode} not found`);
        }

        const [version] = await this.db.insert(schema.planVersions).values({
            name,
            code,
            scenarioId: scenario.id,
            isFinal,
            isLocked: isFinal, // Final versions are locked by default
        }).returning();

        this.logger.log(`Creating Version: ${name} (${code}) for Scenario ${scenarioCode}`);
        return version;
    }

    async getScenarios() {
        return this.db.query.planScenarios.findMany();
    }

    async getVersions(scenarioInput: string) {
        // Check if input is UUID or Code
        // Simple heuristic: UUID length is 36
        let scenarioId = scenarioInput;

        // If not a UUID (or if we want to support both safely), verify existence
        const scenario = await this.db.query.planScenarios.findFirst({
            where: (scenarios, { or, eq }) => or(
                eq(scenarios.id, scenarioInput),
                eq(scenarios.code, scenarioInput)
            )
        });

        if (!scenario) {
            throw new NotFoundException(`Scenario ${scenarioInput} not found`);
        }

        return this.db.query.planVersions.findMany({
            where: eq(schema.planVersions.scenarioId, scenario.id)
        });
    }

    async ensureFoundation(): Promise<void> {
        this.logger.log('Ensuring EPM Foundation Data...');

        // Default Scenarios
        const scenarios = ['ACTUAL', 'BUDGET', 'FORECAST'];
        for (const code of scenarios) {
            const exists = await this.db.query.planScenarios.findFirst({
                where: eq(schema.planScenarios.code, code)
            });
            if (!exists) {
                await this.createScenario(code.charAt(0) + code.slice(1).toLowerCase(), code, true);
            }
        }

        this.logger.log('EPM Foundation Data Check Complete.');
    }
}
