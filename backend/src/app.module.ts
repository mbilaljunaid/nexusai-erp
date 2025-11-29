import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { ERPModule } from './modules/erp/erp.module';
import { EPMModule } from './modules/epm/epm.module';
import { CRMModule } from './modules/crm/crm.module';
import { HRModule } from './modules/hr/hr.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ServiceModule } from './modules/service/service.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { AIModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { IndustriesModule } from './modules/industries/industries.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { UATModule } from './modules/uat/uat.module';
import { ERPAdvancedModule } from './modules/erp/erp-advanced.module';
import { FinanceAdvancedModule } from './modules/finance/finance-advanced.module';
import { CRMAdvancedModule } from './modules/crm/crm-advanced.module';
import { HRAdvancedModule } from './modules/hr/hr-advanced.module';
import { ServiceAdvancedModule } from './modules/service/service-advanced.module';
import { MarketingAdvancedModule } from './modules/marketing/marketing-advanced.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { BPMAdvancedModule } from './modules/bpm/bpm-advanced.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { FieldServiceModule } from './modules/field-service/field-service.module';
import { BillingModule } from './modules/billing/billing.module';
import { EventsModule } from './modules/events/events.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { TestingModule } from './modules/testing/testing.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'nexusai',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
      },
    }),
    AuthModule,
    ERPModule,
    EPMModule,
    CRMModule,
    HRModule,
    ProjectsModule,
    ServiceModule,
    MarketingModule,
    FinanceModule,
    InventoryModule,
    ProcurementModule,
    AIModule,
    HealthModule,
    IndustriesModule,
    ComplianceModule,
    UATModule,
    ERPAdvancedModule,
    FinanceAdvancedModule,
    CRMAdvancedModule,
    HRAdvancedModule,
    ServiceAdvancedModule,
    MarketingAdvancedModule,
    AnalyticsModule,
    IntegrationModule,
    BPMAdvancedModule,
    CopilotModule,
    FieldServiceModule,
    BillingModule,
    EventsModule,
    TenantsModule,
    TestingModule,
    AuditModule,
  ],
})
export class AppModule {}
