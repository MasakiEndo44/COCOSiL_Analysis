#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const API_URL = process.env.COCOSIL_API_URL ?? 'http://localhost:3000/api/fortune-calc-v2';
const TOTAL_REQUESTS = Number(process.env.TOTAL_REQUESTS ?? 60);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 12);
const OUTPUT_PATH = process.env.OUTPUT_PATH ?? 'test-results/performance/fortune-edge-performance.json';

if (Number.isNaN(TOTAL_REQUESTS) || Number.isNaN(CONCURRENCY)) {
  console.error('TOTAL_REQUESTS and CONCURRENCY must be numeric');
  process.exit(1);
}

const randomBirthdate = () => {
  const year = 1960 + Math.floor(Math.random() * 50);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return { year, month, day };
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendRequest(payload) {
  const start = performance.now();
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      duration: performance.now() - start,
      error: error.message,
    };
  }

  const duration = performance.now() - start;
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  return {
    ok: response.ok && data?.success,
    status: response.status,
    duration,
    apiProcessingTime: data?.metadata?.processingTimeMs ?? null,
    cacheHit: data?.metadata?.cache?.hit ?? false,
    payload,
    error: data?.error || (response.ok ? null : 'HTTP error'),
  };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

async function run() {
  console.log('➡️  Fortune Edge Runtime performance test');
  console.log(`Target: ${API_URL}`);
  console.log(`Total requests: ${TOTAL_REQUESTS} (concurrency ${CONCURRENCY})`);
  console.log('------------------------------------------------------------');

  const payloads = Array.from({ length: TOTAL_REQUESTS }, () => randomBirthdate());
  const results = [];

  for (let i = 0; i < payloads.length; i += CONCURRENCY) {
    const batch = payloads.slice(i, i + CONCURRENCY);
    const batchStart = performance.now();

    const batchResults = await Promise.all(batch.map(payload => sendRequest(payload)));
    results.push(...batchResults);

    const batchDuration = performance.now() - batchStart;
    console.log(`Batch ${i / CONCURRENCY + 1}: ${batchResults.length} requests in ${batchDuration.toFixed(0)} ms`);

    // gentle pause to avoid overwhelming the dev server
    await sleep(50);
  }

  const successes = results.filter(r => r.ok);
  const failures = results.filter(r => !r.ok);
  const durations = successes.map(r => r.duration).sort((a, b) => a - b);
  const processingTimes = successes
    .map(r => r.apiProcessingTime)
    .filter(Boolean)
    .sort((a, b) => a - b);

  const stats = {
    target: API_URL,
    totalRequests: results.length,
    successCount: successes.length,
    failureCount: failures.length,
    successRate: results.length ? (successes.length / results.length) * 100 : 0,
    cacheHitRate: successes.length
      ? (successes.filter(r => r.cacheHit).length / successes.length) * 100
      : 0,
    timings: {
      min: durations[0] ?? 0,
      avg: durations.reduce((sum, d) => sum + d, 0) / (durations.length || 1),
      p50: percentile(durations, 50),
      p75: percentile(durations, 75),
      p90: percentile(durations, 90),
      p95: percentile(durations, 95),
      p99: percentile(durations, 99),
      max: durations[durations.length - 1] ?? 0,
    },
    apiProcessing: {
      p50: percentile(processingTimes, 50),
      p90: percentile(processingTimes, 90),
      p95: percentile(processingTimes, 95),
    },
    failures: failures.slice(0, 5),
  };

  console.log('\nSummary');
  console.log('------------------------------------------------------------');
  console.log(`Success rate: ${stats.successRate.toFixed(1)} % (failures ${stats.failureCount})`);
  console.log(`Latency avg: ${stats.timings.avg.toFixed(1)} ms | p95 ${stats.timings.p95.toFixed(1)} ms | max ${stats.timings.max.toFixed(1)} ms`);
  console.log(`Edge processing p95: ${stats.apiProcessing.p95 ? stats.apiProcessing.p95.toFixed(1) : 'n/a'} ms`);
  console.log(`Cache hit rate: ${stats.cacheHitRate.toFixed(1)} %`);

  await mkdir(dirname(OUTPUT_PATH), { recursive: true }).catch(() => {});
  await writeFile(OUTPUT_PATH, JSON.stringify({ stats, results }, null, 2), 'utf8');

  console.log(`\nDetailed results written to ${OUTPUT_PATH}`);
}

run().catch(error => {
  console.error('Performance test failed:', error);
  process.exit(1);
});
