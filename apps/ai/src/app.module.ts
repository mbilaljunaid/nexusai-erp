import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIModule } from './ai.module';
import { AiController } from './ai.controller';
import { IntentParserService } from './modules/parser/intent-parser.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AIModule,
    ],
    controllers: [AiController],
    providers: [IntentParserService],
})
export class AppModule { }
