import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { LotService } from './lot.service';
import { SerialService } from './serial.service';

@Controller('api/inventory')
export class LotSerialController {
    constructor(
        private readonly lotService: LotService,
        private readonly serialService: SerialService
    ) { }

    // --- Lots ---

    @Post('lots')
    createLot(@Body() data: any) {
        return this.lotService.create(data);
    }

    @Get('lots')
    findAllLots(@Query() query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        return this.lotService.findAll(query);
    }

    @Get('lots/:id')
    findOneLot(@Param('id') id: string) {
        return this.lotService.findOne(id);
    }

    @Put('lots/:id')
    updateLot(@Param('id') id: string, @Body() data: any) {
        return this.lotService.update(id, data);
    }

    // --- Serials ---

    @Post('serials')
    createSerial(@Body() data: any) {
        return this.serialService.create(data);
    }

    @Get('serials')
    findAllSerials(@Query() query: { limit?: number; offset?: number; search?: string; status?: string; itemId?: string }) {
        return this.serialService.findAll(query);
    }

    @Get('serials/:id')
    findOneSerial(@Param('id') id: string) {
        return this.serialService.findOne(id);
    }

    @Put('serials/:id')
    updateSerial(@Param('id') id: string, @Body() data: any) {
        return this.serialService.update(id, data);
    }
}
