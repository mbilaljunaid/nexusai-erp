import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';

@Controller('api/admin/audit-logs')
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Get()
    async getLogs(
        @Query('page') page = '1',
        @Query('limit') limit = '25',
        @Query('actor') actor?: string,
        @Query('action') action?: string,
        @Query('type') type?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.auditLogsService.findAll({
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            actor,
            action,
            type,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
    }

    @Post()
    async createLog(@Body() data: any) {
        return this.auditLogsService.create(data);
    }
}
