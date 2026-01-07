
import { Controller, Post, Body } from '@nestjs/common';
import { IntentParserService } from './modules/parser/intent-parser.service';

@Controller('ai')
export class AiController {
    constructor(private readonly parser: IntentParserService) { }

    @Post('intent')
    async processIntent(@Body() body: { text: string; tenantId: string; userId: string }) {
        return this.parser.parseIntent(body.text, body.tenantId, body.userId);
    }
}
