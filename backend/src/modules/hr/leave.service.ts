import { Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { Leave } from './entities/leave.entity';

@Injectable()
export class LeaveService {
  private leaves: Leave[] = [];
  private idCounter = 1;

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const leave: Leave = {
      id: this.idCounter++,
      ...createLeaveDto,
      createdAt: new Date(),
    };
    this.leaves.push(leave);
    return leave;
  }

  async findAll(): Promise<Leave[]> {
    return this.leaves;
  }

  async findOne(id: string): Promise<Leave | null> {
    return this.leaves.find(l => l.id === parseInt(id)) ?? null;
  }

  async update(id: string, updateLeaveDto: Partial<CreateLeaveDto>): Promise<Leave | null> {
    const leave = this.leaves.find(l => l.id === parseInt(id));
    if (!leave) return null;
    Object.assign(leave, updateLeaveDto);
    return leave ?? null;
  }

  async remove(id: string): Promise<void> {
    const index = this.leaves.findIndex(l => l.id === parseInt(id));
    if (index > -1) this.leaves.splice(index, 1);
  }
}
