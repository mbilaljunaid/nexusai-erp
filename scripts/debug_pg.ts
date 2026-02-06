
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Provider } from '@nestjs/common';
console.log('Pool loaded:', !!Pool);
console.log('drizzle loaded:', !!drizzle);
console.log('Provider loaded (interface so generic check might fail at runtime? No, it is just a type usually but imported as value here)');
try {
    const x: Provider = { provide: 'x', useValue: 1 };
    console.log('Provider type usage ok');
} catch (e) { console.log('Provider fail', e); }
