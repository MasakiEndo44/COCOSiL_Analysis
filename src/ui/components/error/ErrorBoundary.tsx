'use client';

/**
 * COCOSiL Error Boundary Component
 * React Error Boundaryとユーザー向けエラー表示
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { COCOSiLError, ErrorCode } from '@/lib/error/errorTypes';
import { getRecoveryStrategy } from '@/lib/error/recoveryStrategies';
import { logger } from '@/lib/error/logger';
import { Button } from '@/ui/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: COCOSiLError | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // COCOSiLErrorに変換
    const cocosilError = error instanceof COCOSiLError
      ? error
      : new COCOSiLError(
          'Infrastructure',
          'high',
          ErrorCode.EDGE_RUNTIME_ERROR,
          'errorBoundary.unexpectedError',
          undefined,
          error
        );

    return {
      hasError: true,
      error: cocosilError,
      errorId: cocosilError.id,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // エラーログ記録
    logger.error(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      retryCount: this.state.retryCount
    });

    // 外部エラーハンドラ呼び出し
    if (onError) {
      onError(error, errorInfo);
    }
  }

  // エラーリセット
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0
    });
  };

  // 再試行
  retryAction = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // ページリロード
    window.location.reload();
  };

  // ホームページへ移動
  goHome = () => {
    window.location.href = '/';
  };

  // サポート連絡
  contactSupport = () => {
    window.location.href = '/contact';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // カスタムフォールバックが提供されている場合
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトエラー画面
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          onRetry={this.retryAction}
          onReset={this.resetError}
          onHome={this.goHome}
          onContact={this.contactSupport}
        />
      );
    }

    return this.props.children;
  }
}

// エラーフォールバックコンポーネント
interface ErrorFallbackProps {
  error: COCOSiLError;
  errorId: string | null;
  retryCount: number;
  onRetry: () => void;
  onReset: () => void;
  onHome: () => void;
  onContact: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  retryCount,
  onRetry,
  onReset,
  onHome,
  onContact
}) => {
  const recovery = getRecoveryStrategy(error);
  const isRetryDisabled = retryCount >= 3; // 最大3回まで再試行

  // エラータイプ別のアイコンと色
  const getErrorStyle = () => {
    switch (error.severity) {
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'high':
        return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
  };

  const style = getErrorStyle();

  // エラーメッセージの翻訳
  const getErrorMessage = () => {
    const messages: Record<string, string> = {
      'errorBoundary.unexpectedError': '予期しないエラーが発生しました',
      'openai.rateLimitExceeded': 'AIシステムが混雑しています',
      'diagnosis.dataNotFound': '診断データが見つかりません',
      'network.connectionFailed': 'ネットワーク接続エラーが発生しました'
    };
    
    return messages[error.messageKey] || 'システムエラーが発生しました';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${style.bg} ${style.border} border rounded-lg p-6 shadow-lg`}>
        {/* エラーアイコンとタイトル */}
        <div className="flex items-center mb-4">
          <AlertTriangle className={`h-8 w-8 ${style.color} mr-3`} />
          <h1 className={`text-xl font-semibold ${style.color}`}>
            エラーが発生しました
          </h1>
        </div>

        {/* エラーメッセージ */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            {getErrorMessage()}
          </p>
          
          {/* 復旧戦略のメッセージ */}
          {recovery.userAction && (
            <p className="text-sm text-gray-600">
              {recovery.userAction.message}
            </p>
          )}

          {/* 再試行回数表示 */}
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              再試行回数: {retryCount}/3
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          {/* 復旧戦略のボタン */}
          {recovery.userAction?.buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => {
                switch (button.action) {
                  case 'retry':
                    onRetry();
                    break;
                  case 'reset':
                    onReset();
                    break;
                  case 'continue':
                    if (button.url) {
                      window.location.href = button.url;
                    }
                    break;
                  case 'contact':
                    onContact();
                    break;
                }
              }}
              disabled={button.action === 'retry' && isRetryDisabled}
              className="w-full flex items-center justify-center"
              variant={index === 0 ? 'primary' : 'secondary'}
            >
              {button.action === 'retry' && <RefreshCw className="h-4 w-4 mr-2" />}
              {button.action === 'contact' && <Mail className="h-4 w-4 mr-2" />}
              {button.label}
            </Button>
          ))}

          {/* デフォルトアクション */}
          {!recovery.userAction && (
            <>
              {!isRetryDisabled && (
                <Button onClick={onRetry} className="w-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再試行
                </Button>
              )}
              
              <Button 
                onClick={onHome} 
                variant="secondary" 
                className="w-full flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
              
              <Button 
                onClick={onContact} 
                variant="secondary" 
                className="w-full flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                サポートに連絡
              </Button>
            </>
          )}
        </div>

        {/* エラーID（サポート用） */}
        {errorId && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              エラーID: <code className="bg-gray-100 px-1 rounded">{errorId}</code>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              サポートにお問い合わせの際は、このIDをお伝えください。
            </p>
          </div>
        )}

        {/* 心理的安全性メッセージ */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            <span className="font-medium">大丈夫です。</span>
            このエラーによってあなたのデータが失われることはありません。
            問題は技術的なものであり、あなたに責任はございません。
          </p>
        </div>
      </div>
    </div>
  );
};


// カスタムフック: エラーレポート
export function useErrorHandler() {
  const reportError = (error: unknown, context?: Record<string, any>) => {
    if (error instanceof COCOSiLError) {
      logger.error(error, context);
    } else {
      const cocosilError = new COCOSiLError(
        'Operational',
        'moderate',
        ErrorCode.VALIDATION_FAILED,
        'error.userReported',
        context,
        error
      );
      logger.error(cocosilError, context);
    }
  };

  return { reportError };
}