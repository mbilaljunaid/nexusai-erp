
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { EPMModule } from './modules/epm/epm.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    EPMModule,
    AdminModule,
    // ProjectsModule,
    // FinanceModule,
  ],
})
export class AppModule { }
