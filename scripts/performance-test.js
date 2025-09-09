#!/usr/bin/env node
/**
 * COCOSiL算命学API パフォーマンステスト
 * 
 * 目標: P95 < 100ms, 同時接続50人対応
 * テスト方法: 50並列リクエスト x 100回実行
 */

const API_URL = 'http://localhost:3001/api/fortune-calc-v2';

// テストデータ生成
function generateTestData(count = 100) {
  const testCases = [];
  for (let i = 0; i < count; i++) {
    testCases.push({
      year: 1960 + Math.floor(Math.random() * 65), // 1960-2025
      month: 1 + Math.floor(Math.random() * 12),   // 1-12
      day: 1 + Math.floor(Math.random() * 28)      // 1-28 (安全な範囲)
    });
  }
  return testCases;
}

// 単一リクエストの実行時間測定
async function measureSingleRequest(testData) {
  const start = performance.now();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const end = performance.now();
    const duration = end - start;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      duration,
      cached: result.cached || false,
      data: result.data
    };
    
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    return {
      success: false,
      duration,
      error: error.message
    };
  }
}

// 並列リクエスト実行
async function runConcurrentTest(concurrency = 50, iterations = 100) {
  console.log(`🚀 パフォーマンステスト開始`);
  console.log(`設定: ${concurrency}並列 x ${iterations}回実行`);
  console.log(`目標: P95 < 100ms, エラー率 < 1%\n`);
  
  const testData = generateTestData(iterations);
  const results = [];
  
  // ウォームアップ (5回)
  console.log('⏳ ウォームアップ中...');
  for (let i = 0; i < 5; i++) {
    await measureSingleRequest(testData[0]);
  }
  console.log('✅ ウォームアップ完了\n');
  
  const testStartTime = Date.now();
  
  // 並列実行をバッチで処理
  const batchSize = concurrency;
  const batches = Math.ceil(iterations / batchSize);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, iterations);
    const batchData = testData.slice(batchStart, batchEnd);
    
    console.log(`📦 Batch ${batch + 1}/${batches}: ${batchData.length}件並列実行中...`);
    
    // バッチ内で並列実行
    const batchPromises = batchData.map(data => measureSingleRequest(data));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // プログレス表示
    const progress = ((batch + 1) / batches * 100).toFixed(1);
    console.log(`✅ Batch ${batch + 1} 完了 (${progress}%)`);
  }
  
  const testEndTime = Date.now();
  const totalTestTime = testEndTime - testStartTime;
  
  // 結果分析
  const successResults = results.filter(r => r.success);
  const errorResults = results.filter(r => !r.success);
  const durations = successResults.map(r => r.duration);
  const cachedCount = successResults.filter(r => r.cached).length;
  
  durations.sort((a, b) => a - b);
  
  const stats = {
    total: results.length,
    success: successResults.length,
    errors: errorResults.length,
    errorRate: (errorResults.length / results.length * 100),
    cached: cachedCount,
    cacheRate: (cachedCount / successResults.length * 100),
    
    // レスポンス時間統計
    min: durations[0] || 0,
    max: durations[durations.length - 1] || 0,
    avg: durations.reduce((sum, d) => sum + d, 0) / durations.length || 0,
    p50: durations[Math.floor(durations.length * 0.5)] || 0,
    p95: durations[Math.floor(durations.length * 0.95)] || 0,
    p99: durations[Math.floor(durations.length * 0.99)] || 0,
    
    // スループット
    totalTime: totalTestTime,
    requestsPerSecond: (results.length / (totalTestTime / 1000))
  };
  
  // 結果レポート
  console.log(`\n📊 パフォーマンステスト結果`);
  console.log(`==========================================`);
  console.log(`総リクエスト数: ${stats.total}`);
  console.log(`成功: ${stats.success} (${(100 - stats.errorRate).toFixed(2)}%)`);
  console.log(`エラー: ${stats.errors} (${stats.errorRate.toFixed(2)}%)`);
  console.log(`キャッシュヒット: ${stats.cached}/${stats.success} (${stats.cacheRate.toFixed(1)}%)`);
  console.log(`\n⏱️  レスポンス時間 (ms):`);
  console.log(`  Min:  ${stats.min.toFixed(1)}ms`);
  console.log(`  Avg:  ${stats.avg.toFixed(1)}ms`);
  console.log(`  P50:  ${stats.p50.toFixed(1)}ms`);
  console.log(`  P95:  ${stats.p95.toFixed(1)}ms ${stats.p95 < 100 ? '✅' : '❌'}`);
  console.log(`  P99:  ${stats.p99.toFixed(1)}ms ${stats.p99 < 500 ? '✅' : '❌'}`);
  console.log(`  Max:  ${stats.max.toFixed(1)}ms`);
  console.log(`\n🚀 スループット:`);
  console.log(`  総テスト時間: ${(stats.totalTime / 1000).toFixed(1)}秒`);
  console.log(`  リクエスト/秒: ${stats.requestsPerSecond.toFixed(1)} req/s`);
  
  // 判定
  console.log(`\n📝 判定結果:`);
  const p95Pass = stats.p95 < 100;
  const errorRatePass = stats.errorRate < 1.0;
  const throughputPass = stats.requestsPerSecond >= 50;
  
  console.log(`  P95 < 100ms: ${p95Pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  エラー率 < 1%: ${errorRatePass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  スループット ≥ 50 req/s: ${throughputPass ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallPass = p95Pass && errorRatePass && throughputPass;
  console.log(`\n🎯 総合判定: ${overallPass ? '✅ 全要件クリア' : '❌ 改善が必要'}`);
  
  // エラー詳細
  if (errorResults.length > 0) {
    console.log(`\n❌ エラー詳細:`);
    const errorGroups = {};
    errorResults.forEach(error => {
      const key = error.error;
      errorGroups[key] = (errorGroups[key] || 0) + 1;
    });
    
    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}件`);
    });
  }
  
  return stats;
}

// メイン実行
async function main() {
  try {
    const stats = await runConcurrentTest(50, 100);
    
    // 終了コードの設定
    const success = stats.p95 < 100 && stats.errorRate < 1.0;
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('🚨 テスト実行エラー:', error);
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  main();
}

module.exports = { runConcurrentTest, measureSingleRequest };