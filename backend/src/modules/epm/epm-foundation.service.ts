
import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanScenario } from './entities/plan-scenario.entity';
import { PlanVersion } from './entities/plan-version.entity';

@Injectable()
export class EPMFoundationService {
    private readonly logger = new Logger(EPMFoundationService.name);

    constructor(
        @InjectRepository(PlanScenario)
        private scenarioRepository: Repository<PlanScenario>,
        @InjectRepository(PlanVersion)
        private versionRepository: Repository<PlanVersion>,
    ) { }

    async createScenario(name: string, code: string, isSystem = false): Promise<PlanScenario> {
        const existing = await this.scenarioRepository.findOneBy({ code });
        if (existing) {
            throw new ConflictException(`Scenario with code ${code} already exists`);
        }

        const scenario = this.scenarioRepository.create({ name, code, isSystem });
        this.logger.log(`Creating Scenario: ${name} (${code})`);
        return this.scenarioRepository.save(scenario);
    }

    async createVersion(name: string, code: string, scenarioCode: string, isFinal = false): Promise<PlanVersion> {
        const scenario = await this.scenarioRepository.findOneBy({ code: scenarioCode });
        if (!scenario) {
            throw new NotFoundException(`Scenario ${scenarioCode} not found`);
        }

        const version = this.versionRepository.create({
            name,
            code,
            scenario,
            isFinal,
            isLocked: isFinal, // Final versions are locked by default
        });

        this.logger.log(`Creating Version: ${name} (${code}) for Scenario ${scenarioCode}`);
        return this.versionRepository.save(version);
    }

    async getScenarios(): Promise<PlanScenario[]> {
        return this.scenarioRepository.find();
    }

    async getVersions(scenarioInput: string): Promise<PlanVersion[]> {
        // Check if input is UUID or Code
        let scenario = await this.scenarioRepository.findOneBy({ id: scenarioInput });
        if (!scenario) {
            scenario = await this.scenarioRepository.findOneBy({ code: scenarioInput });
        }

        if (!scenario) {
            throw new NotFoundException(`Scenario ${scenarioInput} not found`);
        }

        return this.versionRepository.find({ where: { scenarioId: scenario.id } });
    }

    async ensureFoundation(): Promise<void> {
        this.logger.log('Ensuring EPM Foundation Data...');

        // Default Scenarios
        const scenarios = ['ACTUAL', 'BUDGET', 'FORECAST'];
        for (const code of scenarios) {
            const exists = await this.scenarioRepository.findOneBy({ code });
            if (!exists) {
                await this.createScenario(code.charAt(0) + code.slice(1).toLowerCase(), code, true);
            }
        }

        this.logger.log('EPM Foundation Data Check Complete.');
    }
}
