
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class ProjectService {
    constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

    async create(data: any) {
        const [project] = await this.db.insert(schema.projects2).values({
            name: data.name,
            description: data.description,
            status: data.status || 'active',
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
        }).returning();
        return project;
    }

    async findAll() {
        return this.db.select().from(schema.projects2);
    }

    async findOne(id: string) {
        const [project] = await this.db.select().from(schema.projects2).where(eq(schema.projects2.id, id));
        return project || null;
    }
}
