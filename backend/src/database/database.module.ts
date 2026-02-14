import { Global, Module } from '@nestjs/common';
import { DrizzleProvider, DatabaseAliasProvider, DRIZZLE_DB, DATABASE } from './drizzle.provider';

@Global()
@Module({
    providers: [DrizzleProvider, DatabaseAliasProvider],
    exports: [DrizzleProvider, DatabaseAliasProvider, DRIZZLE_DB, DATABASE],
})
export class DatabaseModule { }
