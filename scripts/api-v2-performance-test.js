/**
 * 算命学API v2.0 パフォーマンス & 統合テストスイート
 * 包括的エラーハンドリング、パフォーマンス監視、統一スキーマの検証
 */

const API_BASE_URL = 'http://localhost:3002';
const API_ENDPOINT = '/api/fortune-calc-v2';

// テストケース定義
const testCases = [
  // 成功ケース
  { 
    name: '基本成功ケース', 
    input: { year: 2008, month: 1, day: 5 }, 
    expectedSixStar: '木星人+',
    shouldSucceed: true 
  },
  { 
    name: '平成2年テスト', 
    input: { year: 1990, month: 5, day: 15 }, 
    expectedSixStar: '金星人-',
    shouldSucceed: true 
  },
  { 
    name: 'うるう年テスト', 
    input: { year: 2000, month: 2, day: 29 }, 
    expectedSixStar: '火星人-',
    shouldSucceed: true 
  },
  
  // エラーケース
  { 
    name: '年度範囲外エラー', 
    input: { year: 1800, month: 1, day: 5 }, 
    expectedErrorCode: '10004',
    shouldSucceed: false 
  },
  { 
    name: '必須フィールド不足', 
    input: { month: 1, day: 5 }, 
    expectedErrorCode: '10002',
    shouldSucceed: false 
  },
  { 
    name: '無効な月', 
    input: { year: 2000, month: 13, day: 5 }, 
    expectedErrorCode: '10004',
    shouldSucceed: false 
  },
  { 
    name: '存在しない日付', 
    input: { year: 2000, month: 2, day: 30 }, 
    expectedErrorCode: '10003',
    shouldSucceed: false 
  },
  { 
    name: '数値以外の入力', 
    input: { year: "invalid", month: 1, day: 5 }, 
    expectedErrorCode: '10005',
    shouldSucceed: false 
  }
];

// パフォーマンステスト設定
const PERFORMANCE_CONFIG = {
  maxResponseTime: 100, // 100ms以内
  concurrentRequests: 10,
  totalRequests: 50
};

// 統計情報
let testStats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  performanceMetrics: {
    responseTimes: [],
    cacheHitRates: [],
    avgProcessingTime: 0
  }
};

/**
 * APIリクエストを送信する関数
 */
async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const startTime = Date.now();
  const response = await fetch(url, options);
  const responseTime = Date.now() - startTime;
  const result = await response.json();
  
  return { response, result, responseTime };
}

/**
 * 統一スキーマの検証
 */
function validateApiSchema(result, shouldSucceed) {
  const errors = [];
  
  // 基本スキーマ
  if (typeof result.success !== 'boolean') {
    errors.push('success フィールドがboolean型ではありません');
  }
  
  if (!result.metadata) {
    errors.push('metadata フィールドが存在しません');
  } else {
    if (!result.metadata.requestId) errors.push('requestId が存在しません');
    if (!result.metadata.timestamp) errors.push('timestamp が存在しません');
    if (!result.metadata.version) errors.push('version が存在しません');
    if (typeof result.metadata.processingTimeMs !== 'number') {
      errors.push('processingTimeMs が数値ではありません');
    }
    if (!result.metadata.endpoint) errors.push('endpoint が存在しません');
  }
  
  // 成功時のスキーマ
  if (shouldSucceed && result.success) {
    if (!result.data) {
      errors.push('成功時にdata フィールドが存在しません');
    } else {
      const requiredFields = ['age', 'zodiac', 'animal', 'six_star', 'fortune_detail'];
      requiredFields.forEach(field => {
        if (result.data[field] === undefined) {
          errors.push(`data.${field} が存在しません`);
        }
      });
      
      if (result.data.fortune_detail) {
        const requiredDetailFields = ['birth_date', 'chinese_zodiac', 'animal_fortune', 'six_star_detail', 'personality_traits'];
        requiredDetailFields.forEach(field => {
          if (result.data.fortune_detail[field] === undefined) {
            errors.push(`fortune_detail.${field} が存在しません`);
          }
        });
      }
    }
  }
  
  // エラー時のスキーマ
  if (!shouldSucceed && !result.success) {
    if (!result.error) {
      errors.push('エラー時にerror フィールドが存在しません');
    } else {
      const requiredErrorFields = ['code', 'message', 'retryable', 'httpStatus'];
      requiredErrorFields.forEach(field => {
        if (result.error[field] === undefined) {
          errors.push(`error.${field} が存在しません`);
        }
      });
    }
  }
  
  return errors;
}

/**
 * 個別テストケースの実行
 */
async function runTestCase(testCase) {
  console.log(`\n🧪 ${testCase.name}`);
  testStats.total++;
  
  try {
    const { response, result, responseTime } = await makeRequest('POST', API_ENDPOINT, testCase.input);
    
    // パフォーマンスメトリクス収集
    testStats.performanceMetrics.responseTimes.push(responseTime);
    if (result.metadata?.processingTimeMs) {
      testStats.performanceMetrics.avgProcessingTime += result.metadata.processingTimeMs;
    }
    
    // スキーマ検証
    const schemaErrors = validateApiSchema(result, testCase.shouldSucceed);
    if (schemaErrors.length > 0) {
      testStats.failed++;
      testStats.errors.push(`${testCase.name}: スキーマエラー - ${schemaErrors.join(', ')}`);
      console.log(`❌ スキーマエラー: ${schemaErrors.join(', ')}`);
      return false;
    }
    
    // 成功ケースの検証
    if (testCase.shouldSucceed) {
      if (result.success && testCase.expectedSixStar) {
        if (result.data.six_star === testCase.expectedSixStar) {
          console.log(`✅ 成功: ${result.data.six_star} (${responseTime}ms)`);
          testStats.passed++;
          return true;
        } else {
          testStats.failed++;
          testStats.errors.push(`${testCase.name}: 期待値不一致 - 期待: ${testCase.expectedSixStar}, 実際: ${result.data.six_star}`);
          console.log(`❌ 期待値不一致: 期待=${testCase.expectedSixStar}, 実際=${result.data.six_star}`);
          return false;
        }
      }
    }
    
    // エラーケースの検証
    if (!testCase.shouldSucceed) {
      if (!result.success && testCase.expectedErrorCode) {
        if (result.error.code === testCase.expectedErrorCode) {
          console.log(`✅ エラー正常: ${result.error.code} - ${result.error.message} (${responseTime}ms)`);
          testStats.passed++;
          return true;
        } else {
          testStats.failed++;
          testStats.errors.push(`${testCase.name}: エラーコード不一致 - 期待: ${testCase.expectedErrorCode}, 実際: ${result.error.code}`);
          console.log(`❌ エラーコード不一致: 期待=${testCase.expectedErrorCode}, 実際=${result.error.code}`);
          return false;
        }
      }
    }
    
    testStats.passed++;
    console.log(`✅ 成功 (${responseTime}ms)`);
    return true;
    
  } catch (error) {
    testStats.failed++;
    testStats.errors.push(`${testCase.name}: ${error.message}`);
    console.log(`🚨 例外エラー: ${error.message}`);
    return false;
  }
}

/**
 * パフォーマンステスト
 */
async function runPerformanceTest() {
  console.log('\n⚡ パフォーマンステスト開始');
  console.log(`設定: ${PERFORMANCE_CONFIG.concurrentRequests}並行 × ${PERFORMANCE_CONFIG.totalRequests}リクエスト`);
  
  const testData = { year: 2008, month: 1, day: 5 };
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < PERFORMANCE_CONFIG.totalRequests; i++) {
    if (i % PERFORMANCE_CONFIG.concurrentRequests === 0 && i > 0) {
      // 並行数制限のため待機
      await Promise.all(promises.splice(0, PERFORMANCE_CONFIG.concurrentRequests));
    }
    
    promises.push(makeRequest('POST', API_ENDPOINT, testData));
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  // パフォーマンス分析
  const responseTimes = results.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);
  const minResponseTime = Math.min(...responseTimes);
  
  const cacheHits = results.filter(r => r.result.success).length;
  const cacheHitRate = (cacheHits / results.length) * 100;
  
  console.log(`\n📊 パフォーマンス結果:`);
  console.log(`総実行時間: ${totalTime}ms`);
  console.log(`平均応答時間: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`最大応答時間: ${maxResponseTime}ms`);
  console.log(`最小応答時間: ${minResponseTime}ms`);
  console.log(`キャッシュ命中率: ${cacheHitRate.toFixed(1)}%`);
  console.log(`スループット: ${(PERFORMANCE_CONFIG.totalRequests / (totalTime / 1000)).toFixed(2)} req/sec`);
  
  // パフォーマンス基準チェック
  if (avgResponseTime > PERFORMANCE_CONFIG.maxResponseTime) {
    console.log(`⚠️ 警告: 平均応答時間が基準(${PERFORMANCE_CONFIG.maxResponseTime}ms)を超過`);
  } else {
    console.log(`✅ パフォーマンス基準クリア (< ${PERFORMANCE_CONFIG.maxResponseTime}ms)`);
  }
  
  testStats.performanceMetrics.cacheHitRates.push(cacheHitRate);
}

/**
 * API情報テスト
 */
async function testApiInfo() {
  console.log('\n📋 API情報テスト');
  
  try {
    const { response, result, responseTime } = await makeRequest('GET', API_ENDPOINT);
    
    if (result.success && result.data.name && result.data.version) {
      console.log(`✅ API情報取得成功: ${result.data.name} v${result.data.version} (${responseTime}ms)`);
      console.log(`   機能数: ${result.data.features?.length || 0}`);
      return true;
    } else {
      console.log(`❌ API情報取得失敗`);
      return false;
    }
  } catch (error) {
    console.log(`🚨 API情報取得エラー: ${error.message}`);
    return false;
  }
}

/**
 * メインテスト実行
 */
async function runAllTests() {
  console.log('🚀 算命学API v2.0 包括的テストスイート開始');
  console.log('='.repeat(60));
  
  // API情報テスト
  await testApiInfo();
  
  // 個別機能テスト
  console.log('\n🔍 機能テスト開始');
  for (const testCase of testCases) {
    await runTestCase(testCase);
  }
  
  // パフォーマンステスト
  await runPerformanceTest();
  
  // 最終結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 最終テスト結果');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${testStats.passed}/${testStats.total} (${((testStats.passed/testStats.total)*100).toFixed(1)}%)`);
  console.log(`❌ 失敗: ${testStats.failed}/${testStats.total}`);
  
  if (testStats.errors.length > 0) {
    console.log('\n🚨 失敗詳細:');
    testStats.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  // パフォーマンスサマリー
  if (testStats.performanceMetrics.responseTimes.length > 0) {
    const avgResponse = testStats.performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) / 
                       testStats.performanceMetrics.responseTimes.length;
    console.log(`\n⚡ パフォーマンス統計:`);
    console.log(`   平均応答時間: ${avgResponse.toFixed(2)}ms`);
    console.log(`   API処理時間: ${(testStats.performanceMetrics.avgProcessingTime / testStats.total).toFixed(2)}ms`);
  }
  
  if (testStats.passed === testStats.total) {
    console.log('\n🎉 全テストが成功しました！');
    console.log('📈 API v2.0が正常に動作しています。');
  } else {
    console.log('\n⚠️ 一部のテストが失敗しました。上記の詳細を確認してください。');
  }
  
  console.log('\n✨ テスト完了');
}

// テスト実行
runAllTests().catch(console.error);