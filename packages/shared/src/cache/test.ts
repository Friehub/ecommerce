import { cacheService } from './index';

async function testCache() {
  console.log('🧪 Testing Redis Cache Layer...');

  // 1. Test Set/Get
  const testKey = 'test:key:' + Date.now();
  const testData = { hello: 'world', timestamp: Date.now() };
  
  await cacheService.set(testKey, testData, 10);
  const retrieved = await cacheService.get<typeof testData>(testKey);

  if (JSON.stringify(retrieved) === JSON.stringify(testData)) {
    console.log('✅ Set/Get works correctly');
  } else {
    console.error('❌ Set/Get failed!', { testData, retrieved });
    process.exit(1);
  }

  // 2. Test Invalidation (Delete)
  await cacheService.delete(testKey);
  const afterDelete = await cacheService.get(testKey);

  if (afterDelete === null) {
    console.log('✅ Invalidation (Delete) works correctly');
  } else {
    console.error('❌ Invalidation failed! Data still exists in cache');
    process.exit(1);
  }

  // 3. Test Wrap (Atomic)
  let callCount = 0;
  const wrapKey = 'test:wrap:' + Date.now();
  const expensiveOp = async () => {
    callCount++;
    return { result: 'expensive', count: callCount };
  };

  const res1 = await cacheService.wrap(wrapKey, expensiveOp, 10);
  const res2 = await cacheService.wrap(wrapKey, expensiveOp, 10);

  if (res1.count === 1 && res2.count === 1) {
    console.log('✅ Wrap (Atomic caching) works correctly');
  } else {
    console.error('❌ Wrap failed! Function called multiple times', { res1, res2 });
    process.exit(1);
  }

  console.log('✨ All Cache tests passed!');
  process.exit(0);
}

testCache().catch(err => {
  console.error('💥 Cache test crashed:', err);
  process.exit(1);
});
