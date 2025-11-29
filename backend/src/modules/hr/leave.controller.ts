import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { Leave } from './entities/leave.entity';

@Controller('api/hr/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto): Promise<Leave> {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  findAll(): Promise<Leave[]> {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Leave | null> {
    return this.leaveService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveDto: Partial<CreateLeaveDto>,
  ): Promise<Leave | null> {
    return this.leaveService.update(id, updateLeaveDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.leaveService.remove(id);
  }
}
