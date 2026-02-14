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
    ],
    providers: [
        DemoEnvironmentsService,
        SupportRequestsService,
        AffiliatesService,
        SystemConfigService,
        TenantsService,
        ModulesService,
    ],
    exports: [
        DemoEnvironmentsService,
        SupportRequestsService,
        AffiliatesService,
        SystemConfigService,
        TenantsService,
        ModulesService,
    ],
})
export class AdminModule { }
