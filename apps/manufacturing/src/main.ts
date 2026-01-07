import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Manufacturing typically runs on port 5006
    await app.listen(5006);
    console.log(`Manufacturing Service running on port 5006`);
}
bootstrap();
