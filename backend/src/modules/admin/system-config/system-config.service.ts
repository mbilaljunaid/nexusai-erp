import { Injectable, NotFoundException } from '@nestjs/common';

interface ConfigItem {
    key: string;
    value: any;
    category?: string;
    description?: string;
    updatedAt: Date;
}

interface FeatureFlag {
    name: string;
    description?: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class SystemConfigService {
    private config: ConfigItem[] = [];
    private flags: FeatureFlag[] = [];

    // Config methods
    async getConfig(category?: string): Promise<{ data: ConfigItem[] }> {
        let filtered = [...this.config];

        if (category) {
            filtered = filtered.filter(c => c.category === category);
        }

        return { data: filtered };
    }

    async getConfigValue(key: string): Promise<{ data: ConfigItem }> {
        const item = this.config.find(c => c.key === key);
        if (!item) {
            throw new NotFoundException(`Config key ${key} not found`);
        }
        return { data: item };
    }

    async setConfig(
        key: string,
        value: any,
        category?: string,
        description?: string
    ): Promise<{ data: ConfigItem }> {
        const index = this.config.findIndex(c => c.key === key);

        const item: ConfigItem = {
            key,
            value,
            category,
            description,
            updatedAt: new Date(),
        };

        if (index === -1) {
            this.config.push(item);
        } else {
            this.config[index] = item;
        }

        return { data: item };
    }

    async deleteConfig(key: string): Promise<{ data: { success: boolean } }> {
        const index = this.config.findIndex(c => c.key === key);
        if (index === -1) {
            throw new NotFoundException(`Config key ${key} not found`);
        }

        this.config.splice(index, 1);
        return { data: { success: true } };
    }

    // Feature Flag methods
    async getFlags(): Promise<{ data: FeatureFlag[] }> {
        return { data: this.flags };
    }

    async checkFlag(name: string): Promise<{ data: { enabled: boolean } }> {
        const flag = this.flags.find(f => f.name === name);
        return { data: { enabled: flag?.enabled || false } };
    }

    async createFlag(data: {
        name: string;
        description?: string;
        enabled?: boolean;
    }): Promise<{ data: FeatureFlag }> {
        const flag: FeatureFlag = {
            name: data.name,
            description: data.description,
            enabled: data.enabled || false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.flags.push(flag);
        return { data: flag };
    }

    async enableFlag(name: string): Promise<{ data: FeatureFlag }> {
        const index = this.flags.findIndex(f => f.name === name);
        if (index === -1) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        this.flags[index] = {
            ...this.flags[index],
            enabled: true,
            updatedAt: new Date(),
        };

        return { data: this.flags[index] };
    }

    async disableFlag(name: string): Promise<{ data: FeatureFlag }> {
        const index = this.flags.findIndex(f => f.name === name);
        if (index === -1) {
            throw new NotFoundException(`Feature flag ${name} not found`);
        }

        this.flags[index] = {
            ...this.flags[index],
            enabled: false,
            updatedAt: new Date(),
        };

        return { data: this.flags[index] };
    }
}
