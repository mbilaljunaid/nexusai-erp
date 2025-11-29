import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ConfigurationService, IndustryConfiguration } from './configuration.service';

@Controller('api/configuration')
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Post()
  save(@Body() config: IndustryConfiguration): IndustryConfiguration {
    return this.configService.save(config);
  }

  @Get('tenant/:tenantId/industry/:industryId')
  getByTenantAndIndustry(
    @Param('tenantId') tenantId: string,
    @Param('industryId') industryId: string,
  ): IndustryConfiguration | { error: string } {
    const config = this.configService.getByTenantAndIndustry(tenantId, industryId);
    return config || { error: 'Configuration not found' };
  }

  @Get('tenant/:tenantId')
  getByTenant(@Param('tenantId') tenantId: string): IndustryConfiguration[] {
    return this.configService.getByTenant(tenantId);
  }

  @Delete('tenant/:tenantId/industry/:industryId')
  delete(
    @Param('tenantId') tenantId: string,
    @Param('industryId') industryId: string,
  ): { success: boolean } {
    const deleted = this.configService.delete(tenantId, industryId);
    return { success: deleted };
  }
}
