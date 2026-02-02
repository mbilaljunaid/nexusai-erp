import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { SourcingService } from './sourcing.service';

@Controller('procurement/sourcing')
export class SourcingController {
    constructor(private readonly sourcingService: SourcingService) { }

    @Post('rfqs')
    createRFQ(@Body() dto: any) {
        return this.sourcingService.createRFQ(dto);
    }

    @Get('rfqs')
    findAllRFQs() {
        return this.sourcingService.findAllRFQs();
    }

    @Get('rfqs/:id')
    findOneRFQ(@Param('id') id: string) {
        return this.sourcingService.findOneRFQ(id);
    }

    @Post('rfqs/:id/publish')
    publishRFQ(@Param('id') id: string) {
        return this.sourcingService.publishRFQ(id);
    }

    @Post('rfqs/:id/quotes')
    submitQuote(@Param('id') id: string, @Body() dto: any) {
        return this.sourcingService.submitQuote(id, dto);
    }

    @Post('quotes/:id/award')
    awardQuote(@Param('id') id: string) {
        return this.sourcingService.awardQuote(id);
    }
}
