
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { PlanProject } from './entities/plan-project.entity';

@Injectable()
export class ProjectIntegrationService {
    private readonly logger = new Logger(ProjectIntegrationService.name);

    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(PlanProject)
        private planProjectRepository: Repository<PlanProject>,
    ) { }

    /**
     * Syncs active projects from the operational ERP table (projects2) 
     * to the EPM Dimension table (plan_projects).
     */
    async syncProjects(): Promise<number> {
        this.logger.log('Syncing ERP Projects to EPM...');

        // 1. Fetch active projects
        const erpProjects = await this.projectRepository.find({
            where: { status: 'active' }
        });

        let syncedCount = 0;

        // 2. Upsert into PlanProject
        for (const proj of erpProjects) {
            // Check if exists by ERP ID or Code (assuming Name or distinct Code field)
            // Ideally Project has a 'code', but projects2 has 'name'. detailed EPM usually needs a code.
            // We will generate a code if missing, or use ID.
            const projectCode = `PROJ-${proj.id.substring(0, 8).toUpperCase()}`;

            let planProj = await this.planProjectRepository.findOne({
                where: { erpProjectId: proj.id }
            });

            if (!planProj) {
                // Try finding by code to avoid dupe if re-synced cleanly
                planProj = await this.planProjectRepository.findOne({ where: { code: projectCode } });
            }

            if (!planProj) {
                planProj = this.planProjectRepository.create({
                    code: projectCode,
                    name: proj.name,
                    description: proj.description,
                    erpProjectId: proj.id,
                    isActive: true
                });
            } else {
                planProj.name = proj.name;
                planProj.description = proj.description;
                planProj.isActive = true;
            }

            await this.planProjectRepository.save(planProj);
            syncedCount++;
        }

        this.logger.log(`Synced ${syncedCount} Projects successfully.`);
        return syncedCount;
    }
}
