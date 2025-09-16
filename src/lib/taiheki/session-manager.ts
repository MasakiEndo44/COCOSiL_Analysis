/**
 * 体癖診断 セッション管理システム
 * 
 * プログレッシブ診断用セッション管理
 * - セッション作成・更新・削除
 * - 結果保存・統計記録
 * - メモリ効率化
 * - プライバシー保護
 */

import { v4 as uuidv4 } from 'uuid';

import {
  DiagnosisSession,
  DiagnosisAnswer,
  DiagnosisResult,
  TaihekiDiagnosisError,
  ERROR_CODES,
  TAIHEKI_CONFIG
} from '@/types/taiheki';

// ============================================================
// セッション保存データ構造
// ============================================================

interface SaveDiagnosisRequest {
  sessionId: string;
  result: DiagnosisResult;
  answers: DiagnosisAnswer[];
  answerPatternHash: string;
  ipHash: string;
  userAgent: string;
}

interface SessionStats {
  activeSessions: number;
  expiredSessions: number;
  completedToday: number;
  averageCompletionTime: number;
}

// ============================================================
// メモリ内セッション管理（開発・プロトタイプ用）
// ============================================================

const sessionStore = new Map<string, DiagnosisSession>();
const cleanupInterval = 1000 * 60 * 10; // 10分ごとのクリーンアップ

// セッション期限切れクリーンアップ
let cleanupTimer: NodeJS.Timeout;

function startSessionCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  
  cleanupTimer = setInterval(() => {
    cleanupExpiredSessions();
  }, cleanupInterval);
}

function cleanupExpiredSessions() {
  const now = new Date();
  const expiredSessions: string[] = [];
  
  sessionStore.forEach((session, sessionId) => {
    if (session.expiresAt < now) {
      expiredSessions.push(sessionId);
    }
  });
  
  expiredSessions.forEach(sessionId => {
    const session = sessionStore.get(sessionId);
    if (session) {
      session.status = 'expired';
      // 期限切れ後は削除（プライバシー保護）
      setTimeout(() => {
        sessionStore.delete(sessionId);
      }, 1000 * 60 * 60); // 1時間後に削除
    }
  });
  
  if (expiredSessions.length > 0) {
    console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
  }
}

// 初期化時にクリーンアップ開始
if (typeof window === 'undefined') {
  startSessionCleanup();
}

// ============================================================
// セッション管理API
// ============================================================

export async function createDiagnosisSession(
  userAgent?: string
): Promise<DiagnosisSession> {
  try {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TAIHEKI_CONFIG.SESSION_TTL_MINUTES * 60 * 1000);
    
    // 同時セッション数制限チェック
    const activeSessionCount = Array.from(sessionStore.values())
      .filter(s => s.status === 'active' && s.expiresAt > now).length;
      
    if (activeSessionCount >= TAIHEKI_CONFIG.MAX_CONCURRENT_SESSIONS) {
      throw new TaihekiDiagnosisError(
        'Maximum concurrent sessions reached',
        ERROR_CODES.SESSION_EXPIRED,
        { activeSessionCount, maxSessions: TAIHEKI_CONFIG.MAX_CONCURRENT_SESSIONS }
      );
    }
    
    const session: DiagnosisSession = {
      id: sessionId,
      currentQuestion: 1,
      answers: [],
      status: 'active',
      expiresAt,
      createdAt: now,
      userAgent
    };
    
    sessionStore.set(sessionId, session);
    
    console.log(`Created session ${sessionId}, expires at ${expiresAt.toISOString()}`);
    return session;
    
  } catch (error) {
    if (error instanceof TaihekiDiagnosisError) {
      throw error;
    }
    
    throw new TaihekiDiagnosisError(
      'Failed to create diagnosis session',
      ERROR_CODES.DATABASE_ERROR,
      { originalError: error }
    );
  }
}

export async function getDiagnosisSession(sessionId: string): Promise<DiagnosisSession | null> {
  try {
    const session = sessionStore.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // 期限切れチェック
    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      return null;
    }
    
    return session;
    
  } catch (error) {
    console.error('Failed to get diagnosis session:', error);
    throw new TaihekiDiagnosisError(
      'Failed to retrieve session',
      ERROR_CODES.DATABASE_ERROR,
      { sessionId, originalError: error }
    );
  }
}

export async function updateDiagnosisSession(
  sessionId: string,
  updates: Partial<Pick<DiagnosisSession, 'currentQuestion' | 'answers' | 'progressData' | 'status'>>
): Promise<DiagnosisSession> {
  try {
    const session = await getDiagnosisSession(sessionId);
    
    if (!session) {
      throw new TaihekiDiagnosisError(
        'Session not found or expired',
        ERROR_CODES.INVALID_SESSION,
        { sessionId }
      );
    }
    
    // セッション更新
    const updatedSession: DiagnosisSession = {
      ...session,
      ...updates
    };
    
    // 完了チェック
    if (updates.status === 'completed') {
      updatedSession.completedAt = new Date();
    }
    
    sessionStore.set(sessionId, updatedSession);
    
    return updatedSession;
    
  } catch (error) {
    if (error instanceof TaihekiDiagnosisError) {
      throw error;
    }
    
    throw new TaihekiDiagnosisError(
      'Failed to update diagnosis session',
      ERROR_CODES.DATABASE_ERROR,
      { sessionId, originalError: error }
    );
  }
}

export async function deleteDiagnosisSession(sessionId: string): Promise<boolean> {
  try {
    const deleted = sessionStore.delete(sessionId);
    
    if (deleted) {
      console.log(`Deleted session ${sessionId}`);
    }
    
    return deleted;
    
  } catch (error) {
    console.error('Failed to delete diagnosis session:', error);
    throw new TaihekiDiagnosisError(
      'Failed to delete session',
      ERROR_CODES.DATABASE_ERROR,
      { sessionId, originalError: error }
    );
  }
}

// ============================================================
// 診断結果保存・統計システム
// ============================================================

interface DiagnosisRecord {
  id: string;
  sessionId: string;
  result: DiagnosisResult;
  answers: DiagnosisAnswer[];
  answerPatternHash: string;
  ipHash: string;
  userAgent: string;
  createdAt: Date;
}

// 統計情報用のメモリストレージ（プロトタイプ用）
const diagnosisRecords: DiagnosisRecord[] = [];
const dailyStats = new Map<string, {
  date: string;
  totalDiagnoses: number;
  completedDiagnoses: number;
  averageCompletionTime: number;
  typeDistribution: Record<string, number>;
}>();

export async function saveDiagnosisResult(request: SaveDiagnosisRequest): Promise<void> {
  try {
    const { sessionId, result, answers, answerPatternHash, ipHash, userAgent } = request;
    
    // 診断記録作成
    const record: DiagnosisRecord = {
      id: uuidv4(),
      sessionId,
      result,
      answers,
      answerPatternHash,
      ipHash,
      userAgent,
      createdAt: new Date()
    };
    
    // メモリに保存（プロトタイプ用）
    diagnosisRecords.push(record);
    
    // 統計情報更新
    await updateDailyStats(record);
    
    // プライバシー保護：古いデータ削除（7日経過後）
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const toRemove = diagnosisRecords.filter(r => r.createdAt < weekAgo);
    toRemove.forEach(record => {
      const index = diagnosisRecords.indexOf(record);
      if (index > -1) {
        diagnosisRecords.splice(index, 1);
      }
    });
    
    console.log(`Saved diagnosis result for session ${sessionId}, primary type: ${result.primaryType}`);
    
  } catch (error) {
    console.error('Failed to save diagnosis result:', error);
    // 統計保存の失敗はAPIレスポンスを阻害しない
  }
}

async function updateDailyStats(record: DiagnosisRecord): Promise<void> {
  const dateKey = record.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
  
  let stats = dailyStats.get(dateKey);
  if (!stats) {
    stats = {
      date: dateKey,
      totalDiagnoses: 0,
      completedDiagnoses: 0,
      averageCompletionTime: 0,
      typeDistribution: {}
    };
    dailyStats.set(dateKey, stats);
  }
  
  stats.totalDiagnoses++;
  stats.completedDiagnoses++;
  
  // 完了時間更新
  if (record.result.completionTime) {
    const totalTime = stats.averageCompletionTime * (stats.completedDiagnoses - 1) + record.result.completionTime;
    stats.averageCompletionTime = totalTime / stats.completedDiagnoses;
  }
  
  // 体癖タイプ分布更新
  const primaryType = record.result.primaryType;
  stats.typeDistribution[primaryType] = (stats.typeDistribution[primaryType] || 0) + 1;
}

// ============================================================
// 統計・分析API
// ============================================================

export async function getDiagnosisStats(): Promise<SessionStats> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let activeSessions = 0;
    let expiredSessions = 0;
    
    sessionStore.forEach(session => {
      if (session.status === 'active' && session.expiresAt > now) {
        activeSessions++;
      } else if (session.status === 'expired' || session.expiresAt <= now) {
        expiredSessions++;
      }
    });
    
    const completedToday = diagnosisRecords.filter(r => r.createdAt >= todayStart).length;
    
    const todayRecords = diagnosisRecords.filter(r => r.createdAt >= todayStart);
    const averageCompletionTime = todayRecords.length > 0 
      ? todayRecords.reduce((sum, r) => sum + (r.result.completionTime || 0), 0) / todayRecords.length
      : 0;
    
    return {
      activeSessions,
      expiredSessions,
      completedToday,
      averageCompletionTime
    };
    
  } catch (error) {
    console.error('Failed to get diagnosis stats:', error);
    throw new TaihekiDiagnosisError(
      'Failed to retrieve statistics',
      ERROR_CODES.DATABASE_ERROR,
      { originalError: error }
    );
  }
}

export async function getDailyStatsRange(
  startDate: Date,
  endDate: Date
): Promise<Array<{
  date: string;
  totalDiagnoses: number;
  completedDiagnoses: number;
  averageCompletionTime: number;
  typeDistribution: Record<string, number>;
}>> {
  try {
    const stats: Array<any> = [];
    
    for (const [dateKey, dailyStat] of dailyStats.entries()) {
      const date = new Date(dateKey);
      if (date >= startDate && date <= endDate) {
        stats.push(dailyStat);
      }
    }
    
    return stats.sort((a, b) => a.date.localeCompare(b.date));
    
  } catch (error) {
    console.error('Failed to get daily stats range:', error);
    throw new TaihekiDiagnosisError(
      'Failed to retrieve daily statistics',
      ERROR_CODES.DATABASE_ERROR,
      { startDate, endDate, originalError: error }
    );
  }
}

// ============================================================
// パフォーマンス・デバッグ関数
// ============================================================

export function getMemoryUsage(): {
  sessionCount: number;
  recordCount: number;
  dailyStatsCount: number;
  estimatedMemoryMB: number;
} {
  const sessionCount = sessionStore.size;
  const recordCount = diagnosisRecords.length;
  const dailyStatsCount = dailyStats.size;
  
  // 大雑把なメモリ使用量推定
  const estimatedMemoryMB = Math.round(
    (sessionCount * 0.5 + recordCount * 2.0 + dailyStatsCount * 0.1) / 1024
  );
  
  return {
    sessionCount,
    recordCount,
    dailyStatsCount,
    estimatedMemoryMB
  };
}

export function clearAllData(): void {
  sessionStore.clear();
  diagnosisRecords.length = 0;
  dailyStats.clear();
  console.log('Cleared all session and diagnosis data');
}

// ============================================================
// 重複検知・分析
// ============================================================

export async function findSimilarAnswerPatterns(
  answerPatternHash: string,
  limit: number = 10
): Promise<Array<{
  record: DiagnosisRecord;
  similarity: number;
}>> {
  try {
    const similarPatterns = diagnosisRecords
      .filter(record => record.answerPatternHash !== answerPatternHash)
      .map(record => ({
        record,
        similarity: calculateAnswerSimilarity(answerPatternHash, record.answerPatternHash)
      }))
      .filter(item => item.similarity > 0.8) // 80%以上の類似度
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
    return similarPatterns;
    
  } catch (error) {
    console.error('Failed to find similar patterns:', error);
    return [];
  }
}

function calculateAnswerSimilarity(hash1: string, hash2: string): number {
  // 簡易的な類似度計算（実際は答えパターンの詳細比較が必要）
  if (hash1 === hash2) return 1.0;
  
  // MD5ハッシュの場合、完全一致以外は0として扱う
  // より高度な類似度計算は答えデータ直接比較が必要
  return 0.0;
}

// ============================================================
// プロセス終了時のクリーンアップ
// ============================================================

process.on('SIGTERM', () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  console.log('Session manager cleanup completed');
});

process.on('SIGINT', () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  console.log('Session manager cleanup completed');
});