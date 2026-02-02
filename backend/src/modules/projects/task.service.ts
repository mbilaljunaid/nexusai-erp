import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  private tasks: Task[] = [];
  private idCounter = 1;

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task: Task = {
      id: this.idCounter++,
      ...createTaskDto,
      createdAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  async findOne(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === parseInt(id)) || null;
  }

  async update(id: string, updateTaskDto: Partial<CreateTaskDto>): Promise<Task | null> {
    const task = this.tasks.find(t => t.id === parseInt(id));
    if (!task) return null;
    Object.assign(task, updateTaskDto);
    return task;
  }

  async remove(id: string): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === parseInt(id));
    if (index > -1) this.tasks.splice(index, 1);
  }
}
