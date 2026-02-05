import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Project } from './entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService, TypeOrmModule],
})
export class ProjectsModule { }
