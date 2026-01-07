import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // ERP on 5004
    const port = process.env.ERP_SERVICE_PORT || 5004;
    await app.listen(port);
    console.log(`ERP Service (CRM, HR, Finance) is running on port ${port}`);
}
bootstrap();
