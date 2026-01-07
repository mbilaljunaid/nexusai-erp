import { Module } from '@nestjs/common';
import { IntentService } from './services/intent.service';
import { ActionsService } from './services/actions.service';
import { ExecutorService } from './services/executor.service';
import { AIController } from './ai.controller';

@Module({
    controllers: [AIController],
    providers: [IntentService, ActionsService, ExecutorService],
    exports: [ActionsService, ExecutorService],
})
export class AIModule { }
