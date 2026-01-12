import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ItemService } from './item.service';

@Controller('inventory/items')
export class ItemController {
    constructor(private readonly itemService: ItemService) { }

    @Post()
    create(@Body() dto: any) {
        return this.itemService.create(dto);
    }

    @Get()
    findAll() {
        return this.itemService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any) {
        return this.itemService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemService.remove(id);
    }
}
