import { Global, Module } from '@nestjs/common';
import { DrizzleProvider, DRIZZLE_DB } from './drizzle.provider';

@Global()
@Module({
    providers: [DrizzleProvider],
    exports: [DrizzleProvider],
})
export class DatabaseModule { }
