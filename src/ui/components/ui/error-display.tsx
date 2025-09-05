import React from 'react'
import { Card } from '@/ui/components/ui/card'
import { Button } from '@/ui/components/ui/button'
import { AlertTriangle, RefreshCw, WifiOff, Server } from 'lucide-react'
import { AppError } from '@/types'

interface ErrorDisplayProps {
  error: AppError | string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  compact?: boolean
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '',
  compact = false 
}: ErrorDisplayProps) {
  const errorObj = typeof error === 'string' 
    ? { code: 'UNKNOWN_ERROR', message: error, timestamp: new Date() }
    : error

  const getErrorIcon = () => {
    switch (errorObj.code) {
      case 'NETWORK_ERROR':
        return <WifiOff className="w-5 h-5 text-red-500" />
      case 'FORTUNE_API_ERROR':
      case 'TIMEOUT_ERROR':
        return <Server className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const getErrorTitle = () => {
    switch (errorObj.code) {
      case 'NETWORK_ERROR':
        return 'ネットワークエラー'
      case 'FORTUNE_API_ERROR':
        return '算命学計算エラー'
      case 'TIMEOUT_ERROR':
        return 'タイムアウトエラー'
      case 'BASIC_INFO_SAVE_FAILED':
        return '保存エラー'
      default:
        return 'エラーが発生しました'
    }
  }

  const getSuggestion = () => {
    switch (errorObj.code) {
      case 'NETWORK_ERROR':
        return 'インターネット接続を確認してください'
      case 'FORTUNE_API_ERROR':
        return 'サーバーとの通信に問題があります'
      case 'TIMEOUT_ERROR':
        return 'しばらく待ってから再度お試しください'
      default:
        return '問題が続く場合は管理者にお問い合わせください'
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        {getErrorIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">{getErrorTitle()}</p>
          <p className="text-xs text-red-600 truncate">{errorObj.message}</p>
        </div>
        {onRetry && errorObj.retryable && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={`p-6 border-red-200 bg-red-50 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {getErrorTitle()}
          </h3>
          
          <p className="text-red-700 mb-3">
            {errorObj.message}
          </p>
          
          <p className="text-sm text-red-600 mb-4">
            {getSuggestion()}
          </p>
          
          {errorObj.details && (
            <details className="mb-4">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                詳細情報を表示
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded border">
                <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(errorObj.details, null, 2)}
                </pre>
              </div>
            </details>
          )}
          
          <div className="flex items-center space-x-3">
            {onRetry && errorObj.retryable && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                再試行
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                onClick={onDismiss}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                閉じる
              </Button>
            )}
          </div>
          
          <div className="mt-4 text-xs text-red-500">
            発生時刻: {errorObj.timestamp.toLocaleString('ja-JP')}
          </div>
        </div>
      </div>
    </Card>
  )
}