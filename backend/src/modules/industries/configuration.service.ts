import { Injectable } from '@nestjs/common';

export interface IndustryConfiguration {
  industryId: string;
  tenantId: string;
  enabledModules: string[];
  taxRules: Record<string, any>;
  laborLaws: Record<string, any>;
  accountingStandard: string;
  currency: string;
  timezone: string;
  language: string;
  complianceRequirements: string[];
  customFields: Record<string, any>;
}

@Injectable()
export class ConfigurationService {
  private configurations: Map<string, IndustryConfiguration> = new Map();

  save(config: IndustryConfiguration): IndustryConfiguration {
    const key = `${config.tenantId}-${config.industryId}`;
    this.configurations.set(key, config);
    return config;
  }

  getByTenantAndIndustry(tenantId: string, industryId: string): IndustryConfiguration | undefined {
    return this.configurations.get(`${tenantId}-${industryId}`);
  }

  getByTenant(tenantId: string): IndustryConfiguration[] {
    const configs: IndustryConfiguration[] = [];
    for (const [key, config] of this.configurations) {
      if (key.startsWith(tenantId)) {
        configs.push(config);
      }
    }
    return configs;
  }

  delete(tenantId: string, industryId: string): boolean {
    return this.configurations.delete(`${tenantId}-${industryId}`);
  }
}
