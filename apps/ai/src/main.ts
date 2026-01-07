import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('AI-Service');
    const app = await NestFactory.create(AppModule);

    const port = process.env.AI_SERVICE_PORT || 5001;
    await app.listen(port);

    logger.log(`AI Service is running on port ${port}`);
}
bootstrap();
