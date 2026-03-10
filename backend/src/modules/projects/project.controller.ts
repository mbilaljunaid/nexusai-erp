
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('projects-v2')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    create(@Body() createProjectDto: any) {
        return this.projectService.create(createProjectDto);
    }

    @Get()
    findAll() {
        return this.projectService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }
}
