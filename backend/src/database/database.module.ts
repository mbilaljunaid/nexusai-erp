import { Global, Module } from '@nestjs/common';
import { DrizzleProvider, DatabaseAliasProvider, DatabasePoolProvider, DRIZZLE_DB, DATABASE, DATABASE_POOL } from './drizzle.provider';

@Global()
@Module({
    providers: [DatabasePoolProvider, DrizzleProvider, DatabaseAliasProvider],
    exports: [DatabasePoolProvider, DrizzleProvider, DatabaseAliasProvider, DRIZZLE_DB, DATABASE, DATABASE_POOL],
})
export class DatabaseModule { }
