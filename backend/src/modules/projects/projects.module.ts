import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [],
  controllers: [TaskController, ProjectController],
  providers: [TaskService, ProjectService],
  exports: [TaskService, ProjectService],
})
export class ProjectsModule { }
