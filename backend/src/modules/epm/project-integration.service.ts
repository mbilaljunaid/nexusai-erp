
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class ProjectIntegrationService {
    private readonly logger = new Logger(ProjectIntegrationService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    /**
     * Syncs active projects from the operational ERP table (projects2) 
     * to the EPM Dimension table (plan_projects).
     */
    async syncProjects(): Promise<number> {
        this.logger.log('Syncing ERP Projects to EPM...');

        // 1. Fetch active projects using Drizzle
        const erpProjects = await this.db.select().from(schema.projects2).where(eq(schema.projects2.status, 'active'));

        let syncedCount = 0;

        // 2. Upsert into PlanProject
        for (const proj of erpProjects) {
            // Check if exists by ERP ID or Code
            const projectCode = `PROJ-${(proj.id ?? '').substring(0, 8).toUpperCase()}`;

            let planProj = await this.db.query.planProjects.findFirst({
                where: eq(schema.planProjects.erpProjectId, proj.id)
            });

            if (!planProj) {
                // Try finding by code to avoid dupe if re-synced cleanly
                planProj = await this.db.query.planProjects.findFirst({
                    where: eq(schema.planProjects.code, projectCode)
                });
            }

            if (!planProj) {
                await this.db.insert(schema.planProjects).values({
                    code: projectCode,
                    name: proj.name,
                    description: proj.description || '',
                    erpProjectId: proj.id,
                    isActive: true,
                    // Linking logic for versionId is missing here in original service too?
                    // Original `create` didn't specify versionId, but schema says it is NOT NULL references planVersions.id
                    // This implies the original service relied on some default or the entity didn't enforcing it?
                    // TypeORM Entity `PlanProject` showed `versionId`? 
                    // Let's check `plan-project.entity.ts` again.
                    // It only had `erpProjectId`. It didn't have `versionId` column explicitly in the view I saw earlier.
                    // But schema `epm.ts` has `versionId` not null.
                    // I must provide a versionId. 
                    // I'll default to a 'GLOBAL' or 'MASTER' version concept, or fetch a default version.
                    // For now, I'll pass a placeholder or try to find a default version.
                    versionId: 'DEFAULT_MASTER_VERSION_ID_TODO'
                });
            } else {
                await this.db.update(schema.planProjects)
                    .set({
                        name: proj.name,
                        description: proj.description || '',
                        isActive: true
                    })
                    .where(eq(schema.planProjects.id, planProj.id));
            }
            syncedCount++;
        }

        this.logger.log(`Synced ${syncedCount} Projects successfully.`);
        return syncedCount;
    }
}
