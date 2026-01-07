import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Logistics runs on port 5007
    await app.listen(5007);
    console.log(`Logistics Service running on port 5007`);
}
bootstrap();
