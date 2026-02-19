import { redisClient, checkRedisHealth } from '../src/cache/redis.client';
import { CacheManagerService } from '../src/cache/cache-manager.service';

interface CacheTestResult {
    test: string;
    passed: boolean;
    details?: any;
    error?: string;
}

async function verifyRedisCache() {
    console.log('🔧 Starting Redis Cache Verification...\n');

    const results: CacheTestResult[] = [];
    const cacheManager = new CacheManagerService();

    try {
        // Test 1: Redis connection
        console.log('Test 1: Redis Connection');
        try {
            const health = await checkRedisHealth();
            results.push({
                test: 'Redis Connection',
                passed: health.healthy,
                details: { latency: health.latency },
            });
            console.log(health.healthy ? '✅ Redis connected successfully' : '❌ Redis connection failed');
            console.log(`   Latency: ${health.latency}ms\n`);
        } catch (error) {
            results.push({
                test: 'Redis Connection',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Redis connection test failed\n');
        }

        // Test 2: Cache set/get operations
        console.log('Test 2: Cache Set/Get Operations');
        try {
            const testKey = 'test:key:1';
            const testValue = { name: 'Test', value: 123, timestamp: Date.now() };

            await cacheManager.set(testKey, testValue, { ttl: 60 });
            const retrieved = await cacheManager.get<typeof testValue>(testKey);

            const passed = JSON.stringify(retrieved) === JSON.stringify(testValue);
            results.push({
                test: 'Cache Set/Get Operations',
                passed,
                details: { set: testValue, retrieved },
            });
            console.log(passed ? '✅ Cache set/get works correctly' : '❌ Cache set/get failed');
            console.log(`   Set: ${JSON.stringify(testValue)}`);
            console.log(`   Retrieved: ${JSON.stringify(retrieved)}\n`);
        } catch (error) {
            results.push({
                test: 'Cache Set/Get Operations',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Cache set/get test failed\n');
        }

        // Test 3: TTL expiration
        console.log('Test 3: TTL Expiration');
        try {
            const testKey = 'test:ttl:1';
            const testValue = 'expires soon';

            await cacheManager.set(testKey, testValue, { ttl: 2 }); // 2 seconds
            const before = await cacheManager.get(testKey);

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 3000));

            const after = await cacheManager.get(testKey);

            const passed = before === testValue && after === null;
            results.push({
                test: 'TTL Expiration',
                passed,
                details: { beforeExpiry: before, afterExpiry: after },
            });
            console.log(passed ? '✅ TTL expiration works correctly' : '❌ TTL expiration failed');
            console.log(`   Before expiry: ${before}`);
            console.log(`   After expiry: ${after}\n`);
        } catch (error) {
            results.push({
                test: 'TTL Expiration',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ TTL expiration test failed\n');
        }

        // Test 4: Cache invalidation
        console.log('Test 4: Cache Invalidation');
        try {
            const testKey = 'test:invalidate:1';
            const testValue = 'to be deleted';

            await cacheManager.set(testKey, testValue);
            const before = await cacheManager.get(testKey);

            await cacheManager.delete(testKey);
            const after = await cacheManager.get(testKey);

            const passed = before === testValue && after === null;
            results.push({
                test: 'Cache Invalidation',
                passed,
                details: { beforeDelete: before, afterDelete: after },
            });
            console.log(passed ? '✅ Cache invalidation works correctly' : '❌ Cache invalidation failed');
            console.log(`   Before delete: ${before}`);
            console.log(`   After delete: ${after}\n`);
        } catch (error) {
            results.push({
                test: 'Cache Invalidation',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Cache invalidation test failed\n');
        }

        // Test 5: Batch operations
        console.log('Test 5: Batch Operations');
        try {
            const entries = [
                { key: 'batch:1', value: { id: 1, name: 'Item 1' } },
                { key: 'batch:2', value: { id: 2, name: 'Item 2' } },
                { key: 'batch:3', value: { id: 3, name: 'Item 3' } },
            ];

            await cacheManager.mset(entries);
            const keys = entries.map(e => e.key);
            const retrieved = await cacheManager.mget(keys);

            const passed = retrieved.every((item, index) =>
                JSON.stringify(item) === JSON.stringify(entries[index].value)
            );

            results.push({
                test: 'Batch Operations',
                passed,
                details: { set: entries.length, retrieved: retrieved.length },
            });
            console.log(passed ? '✅ Batch operations work correctly' : '❌ Batch operations failed');
            console.log(`   Set ${entries.length} items, retrieved ${retrieved.length} items\n`);
        } catch (error) {
            results.push({
                test: 'Batch Operations',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Batch operations test failed\n');
        }

        // Test 6: Pattern invalidation
        console.log('Test 6: Pattern Invalidation');
        try {
            // Set multiple keys with pattern
            await cacheManager.set('pattern:test:1', 'value1');
            await cacheManager.set('pattern:test:2', 'value2');
            await cacheManager.set('pattern:test:3', 'value3');

            // Invalidate pattern
            const deleted = await cacheManager.invalidatePattern('pattern:test:*');

            // Check if keys are deleted
            const check1 = await cacheManager.get('pattern:test:1');
            const check2 = await cacheManager.get('pattern:test:2');

            const passed = deleted >= 3 && check1 === null && check2 === null;
            results.push({
                test: 'Pattern Invalidation',
                passed,
                details: { deletedCount: deleted },
            });
            console.log(passed ? '✅ Pattern invalidation works correctly' : '❌ Pattern invalidation failed');
            console.log(`   Deleted ${deleted} keys\n`);
        } catch (error) {
            results.push({
                test: 'Pattern Invalidation',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Pattern invalidation test failed\n');
        }

        // Test 7: Cache statistics
        console.log('Test 7: Cache Statistics');
        try {
            cacheManager.resetStats();

            await cacheManager.set('stats:test', 'value');
            await cacheManager.get('stats:test'); // hit
            await cacheManager.get('stats:nonexistent'); // miss

            const stats = cacheManager.getStats();

            const passed = stats.hits === 1 && stats.misses === 1 && stats.sets === 1;
            results.push({
                test: 'Cache Statistics',
                passed,
                details: stats,
            });
            console.log(passed ? '✅ Cache statistics work correctly' : '❌ Cache statistics failed');
            console.log(`   Stats: ${JSON.stringify(stats)}\n`);
        } catch (error) {
            results.push({
                test: 'Cache Statistics',
                passed: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            console.log('❌ Cache statistics test failed\n');
        }

    } finally {
        // Cleanup
        await cacheManager.clearAll();
        await redisClient.quit();
        console.log('🔌 Redis connection closed\n');
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
        console.log('\n✅ All Redis cache tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some Redis cache tests failed!');
        process.exit(1);
    }
}

// Run verification
verifyRedisCache().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
