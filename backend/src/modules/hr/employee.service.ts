import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
  ) { }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<typeof schema.employees.$inferSelect> {
    const [employee] = await this.db.insert(schema.employees).values({
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      email: createEmployeeDto.email,
      department: createEmployeeDto.department,
      hireDate: createEmployeeDto.hireDate ? new Date(createEmployeeDto.hireDate) : new Date(),
      status: createEmployeeDto.status || 'Active'
    }).returning();
    return employee;
  }

  async findAll(): Promise<typeof schema.employees.$inferSelect[]> {
    return this.db.query.employees.findMany({
      orderBy: [desc(schema.employees.createdAt)]
    });
  }

  async findOne(id: string): Promise<typeof schema.employees.$inferSelect> {
    const employee = await this.db.query.employees.findFirst({
      where: eq(schema.employees.id, id)
    });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  async update(id: string, updateEmployeeDto: Partial<CreateEmployeeDto>): Promise<typeof schema.employees.$inferSelect> {
    const [updated] = await this.db.update(schema.employees)
      .set({
        firstName: updateEmployeeDto.firstName,
        lastName: updateEmployeeDto.lastName,
        email: updateEmployeeDto.email,
        department: updateEmployeeDto.department,
        hireDate: updateEmployeeDto.hireDate ? new Date(updateEmployeeDto.hireDate) : undefined,
        status: updateEmployeeDto.status
      })
      .where(eq(schema.employees.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Employee ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const [deleted] = await this.db.delete(schema.employees)
      .where(eq(schema.employees.id, id))
      .returning();

    if (!deleted) throw new NotFoundException(`Employee ${id} not found`);
  }
}
