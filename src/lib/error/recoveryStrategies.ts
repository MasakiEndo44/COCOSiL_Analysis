/**
 * COCOSiL Recovery Strategies
 * エラー種別ごとの復旧戦略とフォールバック機構
 */

import { 
  COCOSiLError, 
  ErrorCode, 
  RecoveryStrategy 
} from './errorTypes';

// OpenAI API エラーの復旧戦略
export const getOpenAIRecoveryStrategy = (
  error: any, 
  retryCount: number = 0
): RecoveryStrategy => {
  const isRateLimit = error?.code === 'rate_limit_exceeded' || error?.status === 429;
  const isTimeout = error?.code === 'timeout' || error?.name === 'AbortError';
  const isServerError = error?.status >= 500;

  if (isRateLimit) {
    return {
      canRecover: true,
      autoRetry: {
        maxAttempts: 2,
        backoffMs: 60000, // 1分待機
        exponential: false
      },
      fallback: {
        type: 'alternative',
        description: 'AIチャットの代わりに事前作成済みの診断テンプレートを使用',
        action: async () => {
          // 簡易フォールバックメッセージ (TODO: 実装予定のfallback-templatesに置き換え)
          return {
            message: '現在、AIチャット機能が利用できません。診断結果ページからレポートをご確認ください。'
          };
        }
      },
      userAction: {
        message: 'AIシステムが混雑しています。少し時間をおいて再度お試しください。',
        buttons: [
          { label: '1分後に再試行', action: 'retry' },
          { label: '簡易診断を表示', action: 'continue' }
        ]
      }
    };
  }

  if (isTimeout) {
    return {
      canRecover: true,
      autoRetry: {
        maxAttempts: 3,
        backoffMs: 2000,
        exponential: true
      },
      userAction: {
        message: '応答に時間がかかっています。ネットワーク接続をご確認ください。',
        buttons: [
          { label: '再試行', action: 'retry' },
          { label: 'オフライン診断', action: 'continue' }
        ]
      }
    };
  }

  if (isServerError && retryCount < 2) {
    return {
      canRecover: true,
      autoRetry: {
        maxAttempts: 2,
        backoffMs: 5000,
        exponential: true
      },
      userAction: {
        message: 'サーバーが一時的に利用できません。しばらく待って再度お試しください。',
        buttons: [
          { label: '再試行', action: 'retry' },
          { label: 'サポートに連絡', action: 'contact', url: '/contact' }
        ]
      }
    };
  }

  return {
    canRecover: false,
    userAction: {
      message: 'AIシステムに問題が発生しました。申し訳ございませんが、しばらく後に再度お試しください。',
      buttons: [
        { label: 'ホームに戻る', action: 'reset', url: '/' },
        { label: 'サポートに連絡', action: 'contact', url: '/contact' }
      ]
    }
  };
};

// 診断データエラーの復旧戦略
export const getDiagnosisDataRecoveryStrategy = (
  missingFields: string[]
): RecoveryStrategy => {
  return {
    canRecover: true,
    userAction: {
      message: `診断を完了するために以下の情報が必要です：${missingFields.join('、')}`,
      buttons: [
        { label: '診断を続ける', action: 'continue', url: '/diagnosis' },
        { label: '最初からやり直す', action: 'reset', url: '/diagnosis?reset=true' }
      ]
    }
  };
};

// バリデーションエラーの復旧戦略
export const getValidationRecoveryStrategy = (
  field: string,
  _errorType: string
): RecoveryStrategy => {
  const fieldMessages: Record<string, string> = {
    name: 'お名前を正しく入力してください',
    email: 'メールアドレスの形式を確認してください',
    birthdate: '生年月日を正しく選択してください',
    age: '年齢を正しく入力してください'
  };

  return {
    canRecover: true,
    userAction: {
      message: fieldMessages[field] || 'フォームの内容を確認してください',
      buttons: [
        { label: '修正する', action: 'retry' }
      ]
    }
  };
};

// ローカルストレージエラーの復旧戦略
export const getStorageRecoveryStrategy = (): RecoveryStrategy => {
  return {
    canRecover: true,
    fallback: {
      type: 'degraded',
      description: 'セッション限定での診断データ管理'
    },
    userAction: {
      message: 'ブラウザのストレージに問題があります。ブラウザの設定を確認するか、他のブラウザをお試しください。',
      buttons: [
        { label: '設定を確認', action: 'continue' },
        { label: '新しいセッション', action: 'reset' }
      ]
    }
  };
};

// ネットワークエラーの復旧戦略
export const getNetworkRecoveryStrategy = (): RecoveryStrategy => {
  return {
    canRecover: true,
    autoRetry: {
      maxAttempts: 3,
      backoffMs: 1000,
      exponential: true
    },
    fallback: {
      type: 'offline',
      description: 'オフラインモードで基本的な診断機能を提供'
    },
    userAction: {
      message: 'インターネット接続を確認してください。オフラインでも基本的な診断は可能です。',
      buttons: [
        { label: '再接続を試す', action: 'retry' },
        { label: 'オフライン診断', action: 'continue' }
      ]
    }
  };
};

// Edge Runtime エラーの復旧戦略
export const getEdgeRuntimeRecoveryStrategy = (): RecoveryStrategy => {
  return {
    canRecover: false,
    fallback: {
      type: 'alternative',
      description: 'メンテナンスページへリダイレクト'
    },
    userAction: {
      message: 'システムメンテナンス中です。しばらく経ってから再度アクセスしてください。',
      buttons: [
        { label: 'ステータスページ', action: 'continue', url: '/status' },
        { label: 'サポートに連絡', action: 'contact', url: '/contact' }
      ]
    }
  };
};

// セキュリティエラーの復旧戦略
export const getSecurityRecoveryStrategy = (errorCode: ErrorCode): RecoveryStrategy => {
  switch (errorCode) {
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return {
        canRecover: true,
        autoRetry: {
          maxAttempts: 1,
          backoffMs: 60000, // 1分待機
          exponential: false
        },
        userAction: {
          message: 'アクセス頻度が高すぎます。1分間お待ちください。',
          buttons: [
            { label: '待機する', action: 'retry' }
          ]
        }
      };

    case ErrorCode.UNAUTHORIZED_ACCESS:
      return {
        canRecover: false,
        userAction: {
          message: 'アクセス権限がありません。ログインし直してください。',
          buttons: [
            { label: 'ログイン', action: 'continue', url: '/admin/login' },
            { label: 'ホームに戻る', action: 'reset', url: '/' }
          ]
        }
      };

    case ErrorCode.SUSPICIOUS_ACTIVITY:
      return {
        canRecover: false,
        userAction: {
          message: 'セキュリティ上の理由により、アクセスが制限されました。サポートにお問い合わせください。',
          buttons: [
            { label: 'サポートに連絡', action: 'contact', url: '/contact' }
          ]
        }
      };

    default:
      return {
        canRecover: false,
        userAction: {
          message: 'セキュリティエラーが発生しました。',
          buttons: [
            { label: 'ホームに戻る', action: 'reset', url: '/' }
          ]
        }
      };
  }
};

// メイン復旧戦略決定関数
export const getRecoveryStrategy = (error: COCOSiLError): RecoveryStrategy => {
  // 既に復旧戦略が設定されている場合はそれを使用
  if (error.recovery) {
    return error.recovery;
  }

  // エラーコード別の復旧戦略
  switch (error.code) {
    case ErrorCode.OPENAI_API_ERROR:
    case ErrorCode.OPENAI_RATE_LIMIT:
    case ErrorCode.OPENAI_TIMEOUT:
      return getOpenAIRecoveryStrategy(
        error.cause, 
        error.context?.api?.retryCount || 0
      );

    case ErrorCode.INCOMPLETE_DIAGNOSIS_DATA:
      const missingFields = error.context?.diagnosis?.dataAvailable 
        ? Object.entries(error.context.diagnosis.dataAvailable)
            .filter(([_, available]) => !available)
            .map(([field]) => field)
        : ['診断データ'];
      return getDiagnosisDataRecoveryStrategy(missingFields);

    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_INPUT_FORMAT:
      return getValidationRecoveryStrategy('', error.code);

    case ErrorCode.NETWORK_CONNECTION_ERROR:
      return getNetworkRecoveryStrategy();

    case ErrorCode.EDGE_RUNTIME_ERROR:
    case ErrorCode.FUNCTION_TIMEOUT:
    case ErrorCode.MEMORY_LIMIT_EXCEEDED:
      return getEdgeRuntimeRecoveryStrategy();

    case ErrorCode.RATE_LIMIT_EXCEEDED:
    case ErrorCode.UNAUTHORIZED_ACCESS:
    case ErrorCode.SUSPICIOUS_ACTIVITY:
      return getSecurityRecoveryStrategy(error.code);

    default:
      // デフォルトの復旧戦略
      return {
        canRecover: error.severity !== 'critical',
        userAction: {
          message: '予期しないエラーが発生しました。問題が続く場合はサポートにお問い合わせください。',
          buttons: [
            { label: '再試行', action: 'retry' },
            { label: 'ホームに戻る', action: 'reset', url: '/' },
            { label: 'サポートに連絡', action: 'contact', url: '/contact' }
          ]
        }
      };
  }
};

// 自動復旧実行関数
export const attemptAutoRecovery = async (
  error: COCOSiLError,
  originalAction: () => Promise<any>
): Promise<{ success: boolean; result?: any; error?: COCOSiLError }> => {
  const strategy = getRecoveryStrategy(error);
  
  if (!strategy.canRecover || !strategy.autoRetry) {
    return { success: false, error };
  }

  const { maxAttempts, backoffMs, exponential } = strategy.autoRetry;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 待機時間の計算
      const delay = exponential 
        ? backoffMs * Math.pow(2, attempt - 1)
        : backoffMs;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // 原処理の再実行
      const result = await originalAction();
      return { success: true, result };
      
    } catch (retryError) {
      // 最後の試行でもエラーの場合
      if (attempt === maxAttempts) {
        return { 
          success: false,
          error: retryError instanceof COCOSiLError
            ? retryError
            : new COCOSiLError(
                error.type,
                error.severity,
                error.code,
                'recovery.autoRetryFailed',
                undefined,
                retryError
              )
        };
      }
    }
  }

  return { success: false, error };
};

// フォールバック実行関数
export const executeFallback = async (error: COCOSiLError): Promise<any> => {
  const strategy = getRecoveryStrategy(error);
  
  if (!strategy.fallback?.action) {
    throw new Error('No fallback action available');
  }

  try {
    return await strategy.fallback.action();
  } catch (fallbackError) {
    throw new COCOSiLError(
      'Infrastructure',
      'high',
      ErrorCode.FUNCTION_TIMEOUT,
      'recovery.fallbackFailed',
      undefined,
      fallbackError
    );
  }
};