import { Controller, Get, Put, Delete, Body, Param, Post, Query } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';

@Controller('api/admin/system')
export class SystemConfigController {
    constructor(private readonly configService: SystemConfigService) { }

    // Config endpoints
    @Get('config')
    async getConfig(@Query('category') category?: string) {
        // getAllConfig when no category provided; getConfig by key when specific key given
        return this.configService.getAllConfig();
    }

    @Get('config/:key')
    async getConfigValue(@Param('key') key: string) {
        return this.configService.getConfig(key);
    }

    @Put('config/:key')
    async setConfig(
        @Param('key') key: string,
        @Body() data: { value: any; category?: string; description?: string }
    ) {
        return this.configService.setConfig(key, data.value, data.category, data.description);
    }

    @Delete('config/:key')
    async deleteConfig(@Param('key') key: string) {
        return this.configService.deleteConfig(key);
    }

    // Feature Flags endpoints
    @Get('flags')
    async getFlags() {
        return this.configService.getAllFlags();
    }

    @Get('flags/:name/enabled')
    async checkFlag(@Param('name') name: string) {
        return this.configService.getFlag(name);
    }

    @Post('flags')
    async createFlag(@Body() data: { name: string; description?: string; enabled?: boolean }) {
        return this.configService.createFlag(data as any);
    }

    @Post('flags/:name/enable')
    async enableFlag(@Param('name') name: string) {
        const { data: flag } = await this.configService.getFlag(name);
        if (!flag.enabled) {
            return this.configService.toggleFlag(name);
        }
        return { data: flag };
    }

    @Post('flags/:name/disable')
    async disableFlag(@Param('name') name: string) {
        const { data: flag } = await this.configService.getFlag(name);
        if (flag.enabled) {
            return this.configService.toggleFlag(name);
        }
        return { data: flag };
    }
}
