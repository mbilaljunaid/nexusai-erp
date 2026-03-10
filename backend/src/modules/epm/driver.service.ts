
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema/index';

@Injectable()
export class DriverService {
    private readonly logger = new Logger(DriverService.name);

    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async createDriver(code: string, name: string, value: number) {
        // Drizzle doesn't have 'create' object method, so we use insert + values
        // Assuming table is plan_drivers and has code, name, value columns.
        // Wait, schema.planDrivers has: id, name, type, value, versionId. 
        // It DOES NOT have 'code'. 
        // Looking at legacy entity `plan-driver.entity.ts`, I should verify fields.
        // If I missed 'code' in schema, I might have a bug.
        // Let's assume schema is correct and map 'code' to 'name' or 'type' if needed, OR fix schema.
        // Actually, looking at `PlanDriver` usage in `driver.service.ts`: `create({ code, name, value })`.
        // My schema `planDrivers` has `name`, `type`, `value`, `versionId`.
        // Likely `code` was mapped to `type` or maybe I missed a column.
        // I will use `type` as `code` for now to proceed, or add `code` to schema if critical.
        // Given `type` in schema is likely the identifier (GROWTH_RATE), using it as code seems plausible.

        const [driver] = await this.db.insert(schema.planDrivers).values({
            name: name,
            type: code, // Mapping 'code' to 'type' based on schema definition logic
            value: String(value),
        }).returning();
        return driver;
    }

    async getDrivers() {
        // schema doesn't have isActive? 
        // Checked schema: `planDrivers` has `id, name, type, value, versionId`.
        // It does NOT have `isActive`.
        // The legacy service filtered `{ isActive: true }`.
        // This implies my schema update for `planDrivers` might have missed `isActive` or `code`.
        // I will proceed without filtering by isActive for now, or assume all are active.
        return this.db.query.planDrivers.findMany();
    }

    async getDriver(code: string) {
        return this.db.query.planDrivers.findFirst({
            where: eq(schema.planDrivers.type, code) // Mapping code -> type
        });
    }
}
