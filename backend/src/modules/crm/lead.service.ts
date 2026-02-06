import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../../shared/schema/index';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @Inject('DRIZZLE_DB') private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createLeadDto: CreateLeadDto) {
    const result = await this.db.insert(schema.leads)
      .values({
        ...createLeadDto,
        name: createLeadDto.lastName ? `${createLeadDto.firstName || ''} ${createLeadDto.lastName}`.trim() : createLeadDto.company || 'Unknown',
      })
      .returning();
    return result[0];
  }

  async findAll() {
    return this.db.select().from(schema.leads);
  }

  async findOne(id: string) {
    const result = await this.db.select()
      .from(schema.leads)
      .where(eq(schema.leads.id, id));
    return result[0] || null;
  }

  async update(id: string, updateData: Partial<CreateLeadDto>) {
    const result = await this.db.update(schema.leads)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(schema.leads.id, id))
      .returning();
    return result[0] || null;
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(schema.leads)
      .where(eq(schema.leads.id, id));
  }
}
