import { Pool } from 'pg';
import { databaseConfig } from '../src/config/database.config';

interface PoolTestResult {
    test: string;
    passed: boolean;
    details?: any;
    error?: string;
}

async function verifyDatabasePool() {
    console.log('🔧 Starting Database Pool Verification...\n');

    const results: PoolTestResult[] = [];
    let pool: Pool | null = null;

    try {
        // Test 1: Pool initialization
        console.log('Test 1: Pool Initialization');
        try {
            pool = new Pool(databaseConfig);
            results.push({
                test: 'Pool Initialization',
                passed: true,
                details: {
                    min: databaseConfig.min,
                    max: databaseConfig.max,
                    idleTimeout: databaseConfig.idleTimeoutMillis,
                    connectionTimeout: databaseConfig.connectionTimeoutMillis,
                },
            });
            console.log('✅ Pool initialized successfully\n');
        } catch (error) {
            results.push({
                test: 'Pool Initialization',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Pool initialization failed\n');
            throw error;
        }

        // Test 2: Connection acquisition and release
        console.log('Test 2: Connection Acquisition and Release');
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT 1 as test');
            client.release();

            results.push({
                test: 'Connection Acquisition and Release',
                passed: true,
                details: { queryResult: result.rows[0] },
            });
            console.log('✅ Connection acquired and released successfully\n');
        } catch (error) {
            results.push({
                test: 'Connection Acquisition and Release',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Connection acquisition failed\n');
        }

        // Test 3: Pool statistics
        console.log('Test 3: Pool Statistics');
        try {
            const stats = {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount,
            };

            results.push({
                test: 'Pool Statistics',
                passed: true,
                details: stats,
            });
            console.log('✅ Pool statistics:', stats, '\n');
        } catch (error) {
            results.push({
                test: 'Pool Statistics',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Pool statistics failed\n');
        }

        // Test 4: Multiple concurrent connections
        console.log('Test 4: Multiple Concurrent Connections');
        try {
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(
                    pool.query('SELECT pg_sleep(0.1), $1 as connection_num', [i])
                );
            }

            await Promise.all(promises);

            results.push({
                test: 'Multiple Concurrent Connections',
                passed: true,
                details: { concurrentConnections: 5 },
            });
            console.log('✅ Multiple concurrent connections handled successfully\n');
        } catch (error) {
            results.push({
                test: 'Multiple Concurrent Connections',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Multiple concurrent connections failed\n');
        }

        // Test 5: Pool respects max connections
        console.log('Test 5: Pool Respects Max Connections');
        try {
            const maxConnections = databaseConfig.max || 10;
            const clients = [];

            // Acquire max connections
            for (let i = 0; i < maxConnections; i++) {
                clients.push(await pool.connect());
            }

            const stats = {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount,
            };

            // Release all clients
            clients.forEach(client => client.release());

            results.push({
                test: 'Pool Respects Max Connections',
                passed: stats.total <= maxConnections,
                details: { maxConfigured: maxConnections, actualTotal: stats.total },
            });
            console.log('✅ Pool respects max connections limit\n');
        } catch (error) {
            results.push({
                test: 'Pool Respects Max Connections',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Pool max connections test failed\n');
        }

    } finally {
        if (pool) {
            await pool.end();
            console.log('🔌 Pool closed\n');
        }
    }

    // Print summary
    console.log('='.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.test}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });

    console.log('='.repeat(60));
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log('='.repeat(60));

    if (passed === total) {
        console.log('\n✅ All database pool tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some database pool tests failed!');
        process.exit(1);
    }
}

// Run verification
verifyDatabasePool().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
