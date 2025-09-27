/**
 * COCOSiL Structured Logger
 * Edge Runtime対応の構造化ログシステム
 */

import { 
  COCOSiLError, 
  ErrorSeverity, 
  RequestContext, 
  isCOCOSiLError,
  requiresImmediateAlert 
} from './errorTypes';

// ログレベル
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// ログエントリの構造
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  traceId?: string;
  requestId?: string;
  userId?: string;
  context?: Record<string, any>;
  error?: {
    id: string;
    type: string;
    code: string;
    severity: ErrorSeverity;
    stack?: string;
  };
  performance?: {
    duration?: number;
    memory?: number;
    cpu?: number;
  };
  metadata?: {
    route?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    edge?: boolean;
  };
}

// ログ設定
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStructured: boolean;
  enableRemote: boolean;
  maskSensitiveData: boolean;
  remoteEndpoint?: string;
  environment: 'development' | 'production' | 'test';
}

// デフォルト設定
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableStructured: true,
  enableRemote: process.env.NODE_ENV === 'production',
  maskSensitiveData: true,
  environment: (process.env.NODE_ENV as any) || 'development'
};

// センシティブデータパターン
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /auth/i,
  /credential/i,
  /email/i,
  /phone/i
];

class COCOSiLLogger {
  private config: LoggerConfig;
  private requestContext?: RequestContext;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // リクエストコンテキストの設定
  setRequestContext(context: RequestContext) {
    this.requestContext = context;
  }

  // リクエストコンテキストの取得
  getRequestContext(): RequestContext | undefined {
    return this.requestContext;
  }

  // エラーログ
  error(error: unknown, context?: Record<string, any>) {
    if (isCOCOSiLError(error)) {
      this.logCOCOSiLError(error, context);
    } else {
      this.log('error', this.extractErrorMessage(error), {
        error: this.serializeError(error),
        context
      });
    }
  }

  // 警告ログ
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  // 情報ログ
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  // デバッグログ
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  // パフォーマンスログ
  performance(operation: string, duration: number, context?: Record<string, any>) {
    this.log('info', `Performance: ${operation}`, {
      ...context,
      performance: {
        operation,
        duration,
        memory: this.getMemoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  }

  // API呼び出しログ
  apiCall(method: string, url: string, status: number, duration: number, context?: Record<string, any>) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.log(level, `API ${method} ${this.maskUrl(url)} - ${status}`, {
      ...context,
      api: {
        method,
        url: this.maskUrl(url),
        status,
        duration,
        timestamp: new Date().toISOString()
      }
    });
  }

  // ユーザーアクションログ
  userAction(action: string, userId?: string, context?: Record<string, any>) {
    this.log('info', `User action: ${action}`, {
      ...context,
      user: {
        id: userId ? this.hashUserId(userId) : undefined,
        action,
        timestamp: new Date().toISOString()
      }
    });
  }

  // COCOSiLError専用ログ処理
  private logCOCOSiLError(error: COCOSiLError, context?: Record<string, any>) {
    const logEntry = error.toLogEntry();
    
    this.log('error', error.message, {
      ...context,
      error: {
        id: logEntry.id,
        type: logEntry.type,
        code: logEntry.code,
        severity: logEntry.severity,
        stack: logEntry.stack
      },
      cocosil: true
    });

    // 緊急アラートが必要な場合
    if (requiresImmediateAlert(error)) {
      this.sendImmediateAlert(error);
    }
  }

  // メインログ処理
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      traceId: this.requestContext?.traceId,
      requestId: this.requestContext?.requestId,
      userId: this.requestContext?.userId ? this.hashUserId(this.requestContext.userId) : undefined,
      context: this.config.maskSensitiveData ? this.maskSensitiveData(context) : context,
      metadata: this.requestContext ? {
        route: this.requestContext.route,
        method: this.requestContext.method,
        userAgent: this.requestContext.userAgent ? 'masked' : undefined,
        ip: this.requestContext.ip ? this.maskIp(this.requestContext.ip) : undefined,
        edge: this.isEdgeRuntime()
      } : undefined
    };

    // コンソール出力
    if (this.config.enableConsole) {
      this.consoleLog(entry);
    }

    // 構造化ログ出力
    if (this.config.enableStructured) {
      this.structuredLog(entry);
    }

    // リモートログ送信
    if (this.config.enableRemote && (level === 'error' || level === 'warn')) {
      this.sendRemoteLog(entry);
    }
  }

  // ログレベルチェック
  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= configLevelIndex;
  }

  // コンソール出力
  private consoleLog(entry: LogEntry) {
    const { level, message, timestamp, traceId, error, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}] ${traceId ? `[${traceId}] ` : ''}`;
    
    switch (level) {
      case 'error':
        console.error(prefix + message, { error, context });
        break;
      case 'warn':
        console.warn(prefix + message, { context });
        break;
      case 'info':
        console.info(prefix + message, { context });
        break;
      case 'debug':
        console.debug(prefix + message, { context });
        break;
    }
  }

  // 構造化ログ出力
  private structuredLog(entry: LogEntry) {
    // Edge Runtime対応の構造化JSON出力
    if (typeof process !== 'undefined' && process.stdout) {
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  }

  // リモートログ送信
  private async sendRemoteLog(entry: LogEntry) {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      // Edge Runtime互換のfetch使用
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'cocosil-logger'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // ログ送信エラーはコンソールのみに出力
      console.error('Failed to send remote log:', error);
    }
  }

  // 緊急アラート送信
  private async sendImmediateAlert(error: COCOSiLError) {
    if (!this.config.enableRemote) {
      return;
    }

    const alertData = {
      type: 'critical_error',
      error: error.toLogEntry(),
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      requestContext: this.requestContext
    };

    try {
      // 複数のアラートチャネルに送信
      const alertPromises = [
        // Slack通知（webhook URL設定時）
        process.env.SLACK_WEBHOOK_URL && this.sendSlackAlert(alertData),
        // Discord通知（webhook URL設定時）
        process.env.DISCORD_WEBHOOK_URL && this.sendDiscordAlert(alertData),
        // メール通知（SMTP設定時）
        process.env.ALERT_EMAIL && this.sendEmailAlert(alertData)
      ].filter(Boolean);

      await Promise.allSettled(alertPromises);
    } catch (alertError) {
      console.error('Failed to send immediate alert:', alertError);
    }
  }

  // Slack アラート
  private async sendSlackAlert(alertData: any) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    const slackPayload = {
      text: `🚨 COCOSiL Critical Error Alert`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Error Type', value: alertData.error.type, short: true },
          { title: 'Severity', value: alertData.error.severity, short: true },
          { title: 'Code', value: alertData.error.code, short: true },
          { title: 'Environment', value: alertData.environment, short: true },
          { title: 'Message', value: alertData.error.message, short: false },
          { title: 'Trace ID', value: alertData.requestContext?.traceId || 'N/A', short: true }
        ],
        timestamp: Math.floor(new Date(alertData.timestamp).getTime() / 1000)
      }]
    };

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });
  }

  // Discord アラート
  private async sendDiscordAlert(alertData: any) {
    if (!process.env.DISCORD_WEBHOOK_URL) return;

    const discordPayload = {
      embeds: [{
        title: '🚨 COCOSiL Critical Error',
        color: 0xFF0000,
        fields: [
          { name: 'Error Type', value: alertData.error.type, inline: true },
          { name: 'Severity', value: alertData.error.severity, inline: true },
          { name: 'Code', value: alertData.error.code, inline: true },
          { name: 'Message', value: alertData.error.message, inline: false }
        ],
        timestamp: alertData.timestamp
      }]
    };

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
  }

  // メール アラート（簡易実装）
  private async sendEmailAlert(alertData: any) {
    // 実際の実装では SendGrid, SES などのサービスを使用
    console.log('Email alert would be sent:', alertData);
  }

  // ユーティリティ関数
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  private serializeError(error: unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    return error;
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const masked = { ...data };
    
    const maskValue = (obj: any, key: string) => {
      if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
        obj[key] = '***';
      }
    };

    const traverse = (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          maskValue(obj, key);
          if (typeof obj[key] === 'object') {
            traverse(obj[key]);
          }
        });
      }
    };

    traverse(masked);
    return masked;
  }

  private maskUrl(url: string): string {
    return url.replace(/([?&])(api_key|token|secret|password)=([^&]*)/g, '$1$2=***');
  }

  private hashUserId(userId: string): string {
    // 本番環境では crypto.subtle.digest を使用
    return `user_${Buffer.from(userId).toString('base64').substring(0, 8)}`;
  }

  private maskIp(ip: string): string {
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts.slice(0, -2).join(':')}::***`;
    }
    return '***';
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024); // MB
    }
    return 0;
  }

  private isEdgeRuntime(): boolean {
    return typeof EdgeRuntime !== 'undefined' || 
           typeof process === 'undefined' ||
           process.env.NEXT_RUNTIME === 'edge';
  }
}

// シングルトンインスタンス
export const logger = new COCOSiLLogger();

// リクエストごとのロガー作成
export const createRequestLogger = (context: RequestContext) => {
  const requestLogger = new COCOSiLLogger();
  requestLogger.setRequestContext(context);
  return requestLogger;
};

// 便利な関数エクスポート
export const logError = (error: unknown, context?: Record<string, any>) => {
  logger.error(error, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.performance(operation, duration, context);
};

export const logUserAction = (action: string, userId?: string, context?: Record<string, any>) => {
  logger.userAction(action, userId, context);
};