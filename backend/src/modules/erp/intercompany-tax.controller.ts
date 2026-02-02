import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IntercompanyTaxService, IntercompanyTransaction } from './intercompany-tax.service';

@Controller('api/tax/intercompany')
export class IntercompanyTaxController {
    constructor(private readonly intercompanyTaxService: IntercompanyTaxService) { }

    @Post('eliminate')
    async calculateElimination(@Body() transaction: IntercompanyTransaction) {
        return this.intercompanyTaxService.calculateelimination(transaction);
    }
}
