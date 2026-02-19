import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { PpmController } from './ppm.controller';
import { PpmService } from './ppm.service';

@Module({
  imports: [],
  controllers: [TaskController, ProjectController, PpmController],
  providers: [TaskService, ProjectService, PpmService],
  exports: [TaskService, ProjectService, PpmService],
})
export class ProjectsModule { }
