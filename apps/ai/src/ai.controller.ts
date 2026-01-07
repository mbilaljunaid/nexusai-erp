import { Controller, Post, Body, Get } from '@nestjs/common';
import { IntentService } from './services/intent.service';
import { ExecutorService } from './services/executor.service';
import { ActionsService } from './services/actions.service';

@Controller('ai')
export class AIController {
    constructor(
        private readonly intentService: IntentService,
        private readonly executorService: ExecutorService,
        private readonly actionsService: ActionsService,
    ) { }

    @Post('parse')
    async parse(@Body('input') input: string) {
        return this.intentService.parseIntent(input);
    }

    @Post('execute')
    async execute(@Body() body: { userId: string; tenantId: string; actionKey: string; payload: any; userRole?: string }) {
        return this.executorService.executeAction(body.userId, body.tenantId, body.actionKey, body.payload, body.userRole);
    }

    @Get('actions')
    listActions() {
        return this.actionsService.listActions();
    }
}
