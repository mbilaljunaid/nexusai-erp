import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('api/hr/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Partial<CreateEmployeeDto>,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.employeeService.remove(id);
  }
}
