import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Controller('api/procurement/purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Post()
  create(@Body() createPoDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return this.poService.create(createPoDto);
  }

  @Get()
  findAll(): Promise<PurchaseOrder[]> {
    return this.poService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PurchaseOrder | null> {
    return this.poService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePoDto: Partial<CreatePurchaseOrderDto>,
  ): Promise<PurchaseOrder | null> {
    return this.poService.update(id, updatePoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.poService.remove(id);
  }
}
