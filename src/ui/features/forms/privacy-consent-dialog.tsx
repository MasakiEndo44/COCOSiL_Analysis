'use client';

import React from 'react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';

interface PrivacyConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
  onDecline: () => void;
}

export function PrivacyConsentDialog({ 
  isOpen, 
  onClose, 
  onConsent, 
  onDecline 
}: PrivacyConsentDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-light-fg">個人情報の取り扱いについて</h2>
                <p className="text-sm text-light-fg-muted">診断開始前に必ずご確認ください</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 重要なお知らせ */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">プライバシー保護について</h3>
                <p className="text-sm text-blue-800">
                  COCOSiLは、お客様のプライバシーを最優先に考えて設計されています。
                  入力いただく情報は診断目的のみに使用し、第三者への提供は一切行いません。
                </p>
              </div>
            </div>
          </Card>

          {/* 取得する情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-fg">取得する個人情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-light-fg text-sm">お名前</h4>
                  <p className="text-xs text-light-fg-muted">ニックネーム可</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l6-6M6 20.39c.3-.3.68-.39 1-.39h10c.32 0 .7.09 1 .39m-12 0v-4.39a2 2 0 011.85-2L18 14m-8-9v2m0 0V9m0-2h4m-4 0H8m4 9l4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-light-fg text-sm">生年月日</h4>
                  <p className="text-xs text-light-fg-muted">算命学計算に必要</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-light-fg text-sm">メールアドレス</h4>
                  <p className="text-xs text-light-fg-muted">結果通知用</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-light-fg text-sm">診断回答</h4>
                  <p className="text-xs text-light-fg-muted">MBTI・体癖診断</p>
                </div>
              </div>
            </div>
          </div>

          {/* 利用目的 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-fg">利用目的</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">1</span>
                </span>
                <span className="text-sm text-light-fg-muted">診断結果の算出・表示</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">2</span>
                </span>
                <span className="text-sm text-light-fg-muted">AI相談サービスの提供</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">3</span>
                </span>
                <span className="text-sm text-light-fg-muted">システム改善・研究（匿名化後）</span>
              </div>
            </div>
          </div>

          {/* 保護措置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-fg">セキュリティ対策</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-light-fg">暗号化</h4>
                <p className="text-xs text-light-fg-muted">AES-256暗号化</p>
              </Card>
              
              <Card className="p-3 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-light-fg">自動削除</h4>
                <p className="text-xs text-light-fg-muted">30日後削除</p>
              </Card>
              
              <Card className="p-3 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-3-3m-3.636-3.636L12 9l-3 3" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-light-fg">第三者提供禁止</h4>
                <p className="text-xs text-light-fg-muted">一切提供しません</p>
              </Card>
            </div>
          </div>

          {/* 重要事項 */}
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">重要：医療診断ではありません</h3>
                <p className="text-sm text-yellow-800">
                  この診断は自己理解を深めるための参考情報です。医療・心理学的診断や治療の代替にはなりません。
                </p>
              </div>
            </div>
          </Card>

          {/* 詳細リンク */}
          <div className="text-center">
            <p className="text-sm text-light-fg-muted mb-3">
              より詳しい内容については、下記リンクよりご確認ください。
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('/privacy', '_blank')}
              className="text-brand-600 border-brand-600 hover:bg-brand-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              プライバシーポリシー全文を見る
            </Button>
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onDecline}
            >
              同意しない
            </Button>
            <Button
              className="flex-1"
              onClick={onConsent}
            >
              上記に同意して診断を開始
            </Button>
          </div>
          <p className="text-xs text-light-fg-muted text-center mt-3">
            「同意して診断を開始」をクリックすることで、上記の個人情報取り扱いに同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
}