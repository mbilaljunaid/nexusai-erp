import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq } from 'drizzle-orm';
import { CreateGLEntryDto } from './dto/create-gl-entry.dto';

@Injectable()
export class GLEntryService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createGLEntryDto: CreateGLEntryDto): Promise<any> {
    const [glEntry] = await this.db.insert(schema.glEntries)
      .values({
        journalDate: createGLEntryDto.journalDate || new Date(),
        description: createGLEntryDto.description,
        debitAccount: createGLEntryDto.debitAccount,
        creditAccount: createGLEntryDto.creditAccount,
        debitAmount: createGLEntryDto.debitAmount?.toString() || '0',
        creditAmount: createGLEntryDto.creditAmount?.toString() || '0',
        status: 'posted'
      })
      .returning();
    return glEntry;
  }

  async findAll(): Promise<any[]> {
    return this.db.select().from(schema.glEntries);
  }

  async findOne(id: string): Promise<any | null> {
    const results = await this.db.select().from(schema.glEntries).where(eq(schema.glEntries.id, id));
    return results[0] || null;
  }

  async update(id: string, updateGLEntryDto: Partial<CreateGLEntryDto>): Promise<any | null> {
    // Basic update logic
    const payload: any = {};
    if (updateGLEntryDto.description) payload.description = updateGLEntryDto.description;

    await this.db.update(schema.glEntries)
      .set(payload)
      .where(eq(schema.glEntries.id, id));

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(schema.glEntries).where(eq(schema.glEntries.id, id));
  }
}
