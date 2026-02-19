import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../../cache/cache-manager.service';

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

  private readonly CACHE_TTL = parseInt(process.env.CACHE_TTL_TENANTS || '7200', 10); // 2 hours
  private readonly CACHE_NAMESPACE = 'tenants';

  constructor(private readonly cacheManager: CacheManagerService) { }

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

  async getTenant(tenantId: string): Promise<Tenant | undefined> {
    // Try cache first
    const cacheKey = `tenant:${tenantId}`;
    const cached = await this.cacheManager.get<Tenant>(cacheKey, { namespace: this.CACHE_NAMESPACE });

    if (cached) {
      return cached;
    }

    // Get from memory
    const tenant = this.tenants.get(tenantId);

    if (tenant) {
      // Cache for future requests
      await this.cacheManager.set(cacheKey, tenant, {
        ttl: this.CACHE_TTL,
        namespace: this.CACHE_NAMESPACE
      });
    }

    return tenant;
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return undefined;

    Object.assign(tenant, updates, { updatedAt: new Date() });

    // Invalidate cache
    await this.cacheManager.delete(`tenant:${tenantId}`, { namespace: this.CACHE_NAMESPACE });

    return tenant;
  }

  async suspendTenant(tenantId: string): Promise<Tenant | undefined> {
    return await this.updateTenant(tenantId, { status: 'suspended' });
  }

  deleteTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    tenant.status = 'deleted';
    return true;
  }

  async getConfig(tenantId: string): Promise<TenantConfig | undefined> {
    // Try cache first
    const cacheKey = `config:${tenantId}`;
    const cached = await this.cacheManager.get<TenantConfig>(cacheKey, { namespace: this.CACHE_NAMESPACE });

    if (cached) {
      return cached;
    }

    // Get from memory
    const config = this.configs.get(tenantId);

    if (config) {
      // Cache for future requests
      await this.cacheManager.set(cacheKey, config, {
        ttl: this.CACHE_TTL,
        namespace: this.CACHE_NAMESPACE
      });
    }

    return config;
  }

  async updateConfig(tenantId: string, updates: Partial<TenantConfig>): Promise<TenantConfig | undefined> {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    Object.assign(config, updates);

    // Invalidate cache
    await this.cacheManager.delete(`config:${tenantId}`, { namespace: this.CACHE_NAMESPACE });

    return config;
  }

  async enableModule(tenantId: string, moduleName: string): Promise<TenantConfig | undefined> {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    if (!config.enabledModules.includes(moduleName)) {
      config.enabledModules.push(moduleName);
    }

    // Invalidate cache
    await this.cacheManager.delete(`config:${tenantId}`, { namespace: this.CACHE_NAMESPACE });

    return config;
  }

  async disableModule(tenantId: string, moduleName: string): Promise<TenantConfig | undefined> {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    config.enabledModules = config.enabledModules.filter((m) => m !== moduleName);

    // Invalidate cache
    await this.cacheManager.delete(`config:${tenantId}`, { namespace: this.CACHE_NAMESPACE });

    return config;
  }

  async setFeatureFlag(tenantId: string, flagName: string, enabled: boolean): Promise<TenantConfig | undefined> {
    const config = this.configs.get(tenantId);
    if (!config) return undefined;

    config.featureFlags[flagName] = enabled;

    // Invalidate cache
    await this.cacheManager.delete(`config:${tenantId}`, { namespace: this.CACHE_NAMESPACE });

    return config;
  }

  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values()).filter((t) => t.status !== 'deleted');
  }

  getTenantByEmail(email: string): Tenant | undefined {
    return Array.from(this.tenants.values()).find((t) => t.email === email && t.status !== 'deleted');
  }
}
