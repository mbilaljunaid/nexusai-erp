import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformModule } from './modules/platform.module';

@Module({
    imports: [
        // TypeOrmModule.forRoot({...}), // In real app, config comes here
        PlatformModule
    ],
})
export class AppModule { }
