import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Platform on 5002
    const port = process.env.PLATFORM_SERVICE_PORT || 5002;
    await app.listen(port);
    console.log(`Platform Service (Auth/Tenants) is running on port ${port}`);
}
bootstrap();
