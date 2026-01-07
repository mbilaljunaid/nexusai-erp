import { Module } from '@nestjs/common';
import { ERPModule } from './modules/erp.module';

@Module({
    imports: [ERPModule],
})
export class AppModule { }
