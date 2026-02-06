
import 'reflect-metadata';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
// import { DRIZZLE_DB } from '../backend/src/database/drizzle.provider.ts';
import * as schema from '../shared/schema/index.ts';
import { EPMModule } from '../backend/src/modules/epm/epm.module.ts';
// import { EPMFoundationService } from '../backend/src/modules/epm/epm-foundation.service.ts';

console.log('Imports loaded');
if (EPMModule) console.log('EPMModule imported');
// if (EPMFoundationService) console.log('EPMFoundationService imported');

@Injectable()
export class FoundationDebug {
    constructor(@Inject('DRIZZLE_DB') private db: NodePgDatabase<typeof schema>) {
        console.log('FoundationDebug instantiated');
    }
}

console.log('Class defined');
