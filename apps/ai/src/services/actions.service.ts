import { Injectable, Logger } from '@nestjs/common';

export interface ActionDefinition {
    key: string;
    description: string;
    schema: any; // Zod schema
    handler: (payload: any) => Promise<any>;
}

@Injectable()
export class ActionsService {
    private readonly logger = new Logger(ActionsService.name);
    private actions = new Map<string, ActionDefinition>();

    registerAction(definition: ActionDefinition) {
        this.actions.set(definition.key, definition);
        this.logger.log(`Action registered: ${definition.key}`);
    }

    getAction(key: string): ActionDefinition | undefined {
        return this.actions.get(key);
    }

    listActions(): string[] {
        return Array.from(this.actions.keys());
    }
}
