import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ERPService } from './erp.service';

@Controller('erp')
export class ERPController {
    constructor(private readonly service: ERPService) { }

    // CRM
    @Post(':tenantId/crm/leads')
    createLead(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createLead(tenantId, body);
    }
    @Get(':tenantId/crm/leads')
    getLeads(@Param('tenantId') tenantId: string) {
        return this.service.findAllLeads(tenantId);
    }

    // HR
    @Post(':tenantId/hr/employees')
    createEmployee(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createEmployee(tenantId, body);
    }
    @Get(':tenantId/hr/employees')
    getEmployees(@Param('tenantId') tenantId: string) {
        return this.service.findAllEmployees(tenantId);
    }

    // Finance
    @Post(':tenantId/finance/invoices')
    createInvoice(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createInvoice(tenantId, body);
    }
    @Get(':tenantId/finance/invoices')
    getInvoices(@Param('tenantId') tenantId: string) {
        return this.service.findAllInvoices(tenantId);
    }

    // Inventory
    @Post(':tenantId/inventory/items')
    createItem(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createItem(tenantId, body);
    }
    @Get(':tenantId/inventory/items')
    getItems(@Param('tenantId') tenantId: string) {
        return this.service.findAllItems(tenantId);
    }

    // Procurement
    @Post(':tenantId/procurement/suppliers')
    createSupplier(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createSupplier(tenantId, body);
    }
    @Get(':tenantId/procurement/suppliers')
    getSuppliers(@Param('tenantId') tenantId: string) {
        return this.service.findAllSuppliers(tenantId);
    }
    @Post(':tenantId/procurement/orders')
    createPO(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createPO(tenantId, body);
    }
    @Get(':tenantId/procurement/orders')
    getPOs(@Param('tenantId') tenantId: string) {
        return this.service.findAllPOs(tenantId);
    }

    // Projects
    @Post(':tenantId/projects')
    createProject(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createProject(tenantId, body);
    }
    @Get(':tenantId/projects')
    getProjects(@Param('tenantId') tenantId: string) {
        return this.service.findAllProjects(tenantId);
    }
    @Post(':tenantId/projects/tasks')
    createTask(@Param('tenantId') tenantId: string, @Body() body: any) {
        return this.service.createTask(tenantId, body);
    }
    @Get(':tenantId/projects/tasks')
    getTasks(@Param('tenantId') tenantId: string, @Query('projectId') projectId?: string) {
        return this.service.findAllTasks(tenantId, projectId);
    }
}
