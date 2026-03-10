import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { CreateTaskDto } from './dto/create-task.dto';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class TaskService {
  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) { }

  async create(createTaskDto: CreateTaskDto) {
    // Map DTO to Drizzle schema
    // Note: 'project' in DTO maps to 'projectId', 'assignee' to 'assigneeId'
    // This is an adaptation layer - ideally DTO should match schema in future refactors
    const [task] = await this.db.insert(schema.issues).values({
      projectId: createTaskDto.project,
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status || 'todo',
      priority: createTaskDto.priority || 'medium',
      assigneeId: createTaskDto.assignee,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    }).returning();

    return task;
  }

  async findAll() {
    return this.db.select().from(schema.issues);
  }

  async findOne(id: string) {
    const [task] = await this.db.select().from(schema.issues).where(eq(schema.issues.id, id));
    return task || null;
  }

  async update(id: string, updateTaskDto: Partial<CreateTaskDto>) {
    const updateData: any = {};
    if (updateTaskDto.title) updateData.title = updateTaskDto.title;
    if (updateTaskDto.description) updateData.description = updateTaskDto.description;
    if (updateTaskDto.status) updateData.status = updateTaskDto.status;
    if (updateTaskDto.priority) updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.dueDate) updateData.dueDate = new Date(updateTaskDto.dueDate);

    // Simple mapping - ideally use a mapper
    if (updateTaskDto.project) updateData.projectId = updateTaskDto.project;
    if (updateTaskDto.assignee) updateData.assigneeId = updateTaskDto.assignee;

    const [task] = await this.db
      .update(schema.issues)
      .set(updateData)
      .where(eq(schema.issues.id, id))
      .returning();

    return task || null;
  }

  async remove(id: string) {
    await this.db.delete(schema.issues).where(eq(schema.issues.id, id));
  }
}
