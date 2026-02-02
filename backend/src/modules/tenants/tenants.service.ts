import { Injectable } from '@nestjs/common';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  industry: string;
  country: string;
  status: 'active' | 'suspended' | 'deleted';
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface TenantConfig {
  tenantId: string;
  enabledModules: string[];
  featureFlags: Record<string, boolean>;
  customBranding?: {
    logo?: string;
    colors?: Record<string, string>;
    domain?: string;
  };
}

@Injectable()
export class TenantsService {
  private tenants: Map<string, Tenant> = new Map();
  private configs: Map<string, TenantConfig> = new Map();
  private tenantCounter = 1;

  createTenant(
    name: string,
    email: string,
    industry: string,
    country: string,
  ): Tenant {
    const tenant: Tenant = {
      id: `ten_${this.tenantCounter++}`,
      name,
      email,
      industry,
      country,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };

    this.tenants.set(tenant.id, tenant);

    // Create default config
    const config: TenantConfig = {
      tenantId: tenant.id,
      enabledModules: ['dashboard', 'crm', 'projects'],
      featureFlags: {
        sso: false,
        webhooks: false,
        customIntegrations: false,
        advancedAnalytics: false,
      },
    };

    this.configs.set(tenant.id, config);

    return tenant;
  }

  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  updateTenant(tenantId: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return undefined;

    Object.assign(tenant, updates, { updatedAt: new Date() });
    return tenant;
  }

  suspendTenant(tenantId: string): Tenant | undefined {
    return this.updateTenant(tenantId, { status: 'suspended' });
  }

  deleteTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    tenant.status = 'deleted';
    return true;
  }

  getConfig(tenantId: string): TenantConfig | undefined {
    return this.configs.get(tenantId);
  }

  updateConfig(tenantId: string, updates: Partial<TenantConfig>): TenantConfig | undefined {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    Object.assign(config, updates);
    return config;
  }

  enableModule(tenantId: string, moduleName: string): TenantConfig | undefined {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    if (!config.enabledModules.includes(moduleName)) {
      config.enabledModules.push(moduleName);
    }

    return config;
  }

  disableModule(tenantId: string, moduleName: string): TenantConfig | undefined {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    config.enabledModules = config.enabledModules.filter((m) => m !== moduleName);
    return config;
  }

  setFeatureFlag(tenantId: string, flagName: string, enabled: boolean): TenantConfig | undefined {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    config.featureFlags[flagName] = enabled;
    return config;
  }

  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values()).filter((t) => t.status !== 'deleted');
  }

  getTenantByEmail(email: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find((t) => t.email === email && t.status !== 'deleted');
  }
}
