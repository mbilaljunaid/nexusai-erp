import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class LeaveService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createLeaveDto: CreateLeaveDto): Promise<typeof schema.leaveRequests.$inferSelect> {
    if (!createLeaveDto.employeeId) throw new Error('Employee ID required');

    const employee = await this.db.query.employees.findFirst({
      where: eq(schema.employees.id, createLeaveDto.employeeId)
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const [leave] = await this.db.insert(schema.leaveRequests).values({
      employeeId: createLeaveDto.employeeId,
      leaveType: createLeaveDto.leaveType,
      startDate: new Date(createLeaveDto.startDate),
      endDate: new Date(createLeaveDto.endDate),
      reason: createLeaveDto.reason,
      status: createLeaveDto.status || 'PENDING'
    }).returning();
    return leave;
  }

  async findAll(): Promise<typeof schema.leaveRequests.$inferSelect[]> {
    return this.db.query.leaveRequests.findMany({
      orderBy: [desc(schema.leaveRequests.createdAt)]
    });
  }

  async findOne(id: string): Promise<typeof schema.leaveRequests.$inferSelect> {
    const leave = await this.db.query.leaveRequests.findFirst({
      where: eq(schema.leaveRequests.id, id)
    });
    if (!leave) throw new NotFoundException('Leave request not found');
    return leave;
  }

  async update(id: string, updateLeaveDto: Partial<CreateLeaveDto>): Promise<typeof schema.leaveRequests.$inferSelect> {
    const [updated] = await this.db.update(schema.leaveRequests)
      .set({
        leaveType: updateLeaveDto.leaveType,
        startDate: updateLeaveDto.startDate ? new Date(updateLeaveDto.startDate) : undefined,
        endDate: updateLeaveDto.endDate ? new Date(updateLeaveDto.endDate) : undefined,
        reason: updateLeaveDto.reason,
        status: updateLeaveDto.status
      })
      .where(eq(schema.leaveRequests.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Leave request not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const [deleted] = await this.db.delete(schema.leaveRequests)
      .where(eq(schema.leaveRequests.id, id))
      .returning();
    if (!deleted) throw new NotFoundException('Leave request not found');
  }
}
