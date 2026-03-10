import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from '../src/modules/projects/projects.module';
import { DatabaseModule } from '../src/database/database.module';
import { TaskService } from '../src/modules/projects/task.service';
import { ProjectService } from '../src/modules/projects/project.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function run() {
    console.log("Starting TaskService Isolation Test...");

    try {
        console.log("Creating Application Context...");
        // We create a wrapper module to import config and DB
        const { Module } = require('@nestjs/common');
        @Module({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                DatabaseModule,
                ProjectsModule
            ]
        })
        class TestModule { }

        const app = await NestFactory.createApplicationContext(TestModule);
        console.log("Context Created.");
        console.log("App Init Successful.");

        const taskService = app.get<TaskService>(TaskService);
        if (!taskService) throw new Error("TaskService retrieval failed");
        console.log("TaskService Retrieved:", !!taskService);

        const projectService = app.get<ProjectService>(ProjectService);
        console.log("ProjectService Retrieved:", !!projectService);

        // Try to create a task (mock DTO)
        // We assume DB connection works if app init worked (DatabaseModule connects on init).
        // Check if method exists
        if (typeof taskService.create !== 'function') throw new Error("taskService.create is not a function");
        console.log("taskService.create exists.");

        console.log("SUCCESS: TaskService is wiring correctly in isolation.");
        await app.close();

    } catch (e) {
        console.error("FAILURE:", e);
        process.exit(1);
    }
}

run();
