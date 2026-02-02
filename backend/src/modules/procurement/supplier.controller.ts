import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { SupplierService } from './supplier.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming Auth exists
// @UseGuards(JwtAuthGuard)

@Controller('procurement/suppliers')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    create(@Body() createSupplierDto: any) {
        return this.supplierService.create(createSupplierDto);
    }

    @Get()
    findAll() {
        return this.supplierService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.supplierService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.supplierService.update(id, updateData);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.supplierService.remove(id);
    }

    @Post(':id/sites')
    addSite(@Param('id') id: string, @Body() siteData: any) {
        return this.supplierService.addSite(id, siteData);
    }

    @Get(':id/sites')
    getSites(@Param('id') id: string) {
        return this.supplierService.getSites(id);
    }

    @Put('sites/:siteId')
    updateSite(@Param('siteId') siteId: string, @Body() updateData: any) {
        return this.supplierService.updateSite(siteId, updateData);
    }

    @Delete('sites/:siteId')
    removeSite(@Param('siteId') siteId: string) {
        return this.supplierService.removeSite(siteId);
    }
}
