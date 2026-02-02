import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  private employees: Employee[] = [];
  private idCounter = 1;

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee: Employee = {
      id: this.idCounter++,
      ...createEmployeeDto,
      createdAt: new Date(),
    };
    this.employees.push(employee);
    return employee;
  }

  async findAll(): Promise<Employee[]> {
    return this.employees;
  }

  async findOne(id: string): Promise<Employee | null> {
    return this.employees.find(e => e.id === parseInt(id)) || null;
  }

  async update(id: string, updateEmployeeDto: Partial<CreateEmployeeDto>): Promise<Employee | null> {
    const employee = this.employees.find(e => e.id === parseInt(id));
    if (!employee) return null;
    Object.assign(employee, updateEmployeeDto);
    return employee;
  }

  async remove(id: string): Promise<void> {
    const index = this.employees.findIndex(e => e.id === parseInt(id));
    if (index > -1) this.employees.splice(index, 1);
  }
}
