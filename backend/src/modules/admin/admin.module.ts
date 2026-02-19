import { Module } from '@nestjs/common';
import { DemoEnvironmentsController } from './demo-environments/demo-environments.controller';
import { DemoEnvironmentsService } from './demo-environments/demo-environments.service';
import { SupportRequestsController } from './support-requests/support-requests.controller';
import { SupportRequestsService } from './support-requests/support-requests.service';
import { AffiliatesController } from './affiliates/affiliates.controller';
import { AffiliatesService } from './affiliates/affiliates.service';
import { SystemConfigController } from './system-config/system-config.controller';
import { SystemConfigService } from './system-config/system-config.service';
import { TenantsController } from './tenants/tenants.controller';
import { TenantsService } from './tenants/tenants.service';
import { ModulesController } from './modules/modules.controller';
import { ModulesService } from './modules/modules.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { CacheModule } from '../../cache/cache.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule, CacheModule],
    controllers: [
        DemoEnvironmentsController,
        SupportRequestsController,
        AffiliatesController,
        SystemConfigController,
        TenantsController,
        ModulesController,
        MetricsController,
        AuditLogsController,
    ],
    providers: [
        DemoEnvironmentsService,
        SupportRequestsService,
        AffiliatesService,
        SystemConfigService,
        TenantsService,
        ModulesService,
        MetricsService,
        AuditLogsService,
    ],
    exports: [
        DemoEnvironmentsService,
        SupportRequestsService,
        AffiliatesService,
        SystemConfigService,
        TenantsService,
        ModulesService,
        MetricsService,
        AuditLogsService,
    ],
})
export class AdminModule { }
