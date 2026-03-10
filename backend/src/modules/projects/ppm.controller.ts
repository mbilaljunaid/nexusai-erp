import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PpmService } from './ppm.service';

@Controller('ppm/projects')
export class PpmController {
    constructor(private readonly ppmService: PpmService) { }

    /** P0.13: Check budget overrun + schedule delay alerts for a project */
    @Get(':id/alerts')
    checkProjectAlerts(@Param('id') id: string) {
        return this.ppmService.checkProjectAlerts(id);
    }

    /** P0.13: Collect AP invoice costs tagged to this project */
    @Post(':id/collect-from-ap')
    collectFromAP(@Param('id') id: string) {
        return this.ppmService.collectFromAP(id);
    }

    /** P0.14: Generate cost distribution journals for this project */
    @Post(':id/distribute')
    generateDistributions(@Param('id') id: string) {
        return this.ppmService.generateDistributions(id);
    }

    /** P0.15: Interface (capitalize) project costs to Fixed Assets */
    @Post(':id/interface-to-fa')
    interfaceToFA(@Param('id') id: string) {
        return this.ppmService.interfaceToFA(id);
    }
}
