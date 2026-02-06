import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Controller('api/hr/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) { }

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveDto: Partial<CreateLeaveDto>,
  ) {
    return this.leaveService.update(id, updateLeaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
