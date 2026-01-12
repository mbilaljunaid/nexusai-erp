import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';

@Controller('procurement/purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) { }

  @Post()
  create(@Body() createPoDto: any) {
    return this.poService.create(createPoDto);
  }

  @Get()
  findAll() {
    return this.poService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePoDto: any) {
    return this.poService.update(id, updatePoDto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.poService.approve(id);
  }

  @Post(':id/open')
  open(@Param('id') id: string) {
    return this.poService.open(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.poService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.poService.remove(id);
  }
}
