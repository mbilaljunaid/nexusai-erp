import { Controller, Get, Put, Delete, Body, Param, Post, Query } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';

@Controller('api/admin/system')
export class SystemConfigController {
    constructor(private readonly configService: SystemConfigService) { }

    // Config endpoints
    @Get('config')
    async getConfig(@Query('category') category?: string) {
        return this.configService.getConfig(category);
    }

    @Get('config/:key')
    async getConfigValue(@Param('key') key: string) {
        return this.configService.getConfigValue(key);
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
        return this.configService.getFlags();
    }

    @Get('flags/:name/enabled')
    async checkFlag(@Param('name') name: string) {
        return this.configService.checkFlag(name);
    }

    @Post('flags')
    async createFlag(@Body() data: { name: string; description?: string; enabled?: boolean }) {
        return this.configService.createFlag(data);
    }

    @Post('flags/:name/enable')
    async enableFlag(@Param('name') name: string) {
        return this.configService.enableFlag(name);
    }

    @Post('flags/:name/disable')
    async disableFlag(@Param('name') name: string) {
        return this.configService.disableFlag(name);
    }
}
