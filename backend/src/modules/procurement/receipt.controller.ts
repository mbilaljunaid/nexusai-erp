import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReceiptService } from './receipt.service';

@Controller('procurement/receipts')
export class ReceiptController {
    constructor(private readonly receiptService: ReceiptService) { }

    @Post()
    create(@Body() dto: any) {
        return this.receiptService.create(dto);
    }

    @Get()
    findAll() {
        return this.receiptService.findAll();
    }
}
