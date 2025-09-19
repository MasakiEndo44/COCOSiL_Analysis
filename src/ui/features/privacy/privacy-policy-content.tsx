'use client';

import React from 'react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';

export function PrivacyPolicyContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-h1-mobile md:text-h1-desktop font-heading text-light-fg">
          プライバシーポリシー
        </h1>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-2xl mx-auto">
          COCOSiL（ココシル）における個人情報の取り扱いについて
        </p>
        <p className="text-sm text-light-fg-muted">
          最終更新日：2025年1月15日
        </p>
      </div>

      {/* 概要 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">はじめに</h2>
        <p className="text-blue-800 leading-relaxed">
          COCOSiL（ココシル）は、体癖理論・MBTI・算命学・動物占いを統合した診断システムです。
          本プライバシーポリシーは、当システムにおける個人情報の取り扱いについて詳しく説明します。
          私たちは、お客様のプライバシーを最重要視し、個人情報保護法に完全準拠した運営を行っています。
        </p>
      </Card>

      {/* 1. 取得する個人情報 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          1. 取得する個人情報
        </h2>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3">1.1 必須情報</h3>
            <ul className="space-y-2 text-light-fg-muted">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>お名前</strong>：ニックネーム可。診断結果の個別化に使用</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>生年月日</strong>：算命学・動物占い計算に必要</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>メールアドレス</strong>：診断結果の通知に使用</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>性別</strong>：診断精度向上のため（回答しないことも可能）</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3">1.2 診断回答データ</h3>
            <ul className="space-y-2 text-light-fg-muted">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>MBTI診断回答</strong>：12問の質問回答またはタイプ選択</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>体癖診断回答</strong>：20問の質問回答</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>AI相談内容</strong>：診断結果に関する相談内容</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3">1.3 自動取得情報</h3>
            <ul className="space-y-2 text-light-fg-muted">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>診断実施日時</strong>：システム利用状況の把握</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>診断所要時間</strong>：システム改善のため</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>ブラウザ情報</strong>：技術的サポートのため</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 2. 個人情報の利用目的 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          2. 個人情報の利用目的
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">1</span>
              </span>
              診断結果の算出・表示
            </h3>
            <p className="text-light-fg-muted">
              体癖理論・MBTI・算命学・動物占いの各診断結果を算出し、統合された分析結果をお客様に提供します。
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">2</span>
              </span>
              AI相談サービス提供
            </h3>
            <p className="text-light-fg-muted">
              Claude AIを活用して、診断結果に基づく個別化されたアドバイスや相談対応を行います。
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold">3</span>
              </span>
              システム改善・研究
            </h3>
            <p className="text-light-fg-muted">
              匿名化されたデータを用いて、診断精度の向上やシステムの改善を行います。
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3 flex items-center">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 font-bold">4</span>
              </span>
              お客様サポート
            </h3>
            <p className="text-light-fg-muted">
              お問い合わせ対応、技術的サポート、診断結果に関するご質問への回答を行います。
            </p>
          </Card>
        </div>
      </section>

      {/* 3. 個人情報の保護措置 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          3. 個人情報の保護措置
        </h2>
        <div className="space-y-4">
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">3.1 クライアントサイド暗号化</h3>
            <p className="text-green-800 mb-3">
              入力いただいた個人情報は、お客様のブラウザ内で暗号化されてからローカルストレージに保存されます。
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• AES-256暗号化アルゴリズムを使用</li>
              <li>• 暗号化キーは一意のセッションごとに生成</li>
              <li>• サーバーには暗号化された状態でのみ送信</li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">3.2 通信の暗号化</h3>
            <p className="text-blue-800 mb-3">
              すべての通信は SSL/TLS（HTTPS）で暗号化されており、第三者による盗聴や改ざんを防止します。
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• TLS 1.3 プロトコルを使用</li>
              <li>• EV SSL証明書による身元確認</li>
              <li>• Perfect Forward Secrecy対応</li>
            </ul>
          </Card>
          
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">3.3 アクセス制御</h3>
            <p className="text-purple-800 mb-3">
              管理者向けシステムには多層のセキュリティ対策を実装し、不正アクセスを防止します。
            </p>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• JWT認証による厳格なアクセス制御</li>
              <li>• 4桁PINによる二要素認証</li>
              <li>• セッションタイムアウト機能</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 4. データ保持・削除ポリシー */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          4. データ保持・削除ポリシー
        </h2>
        <div className="space-y-4">
          <Card className="p-6 border-l-4 border-l-yellow-400 bg-yellow-50">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">4.1 自動削除システム</h3>
            <p className="text-yellow-800 mb-3">
              <strong>個人識別情報は診断完了から30日後に自動的に削除されます。</strong>
            </p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">クライアントサイド（ブラウザ内）</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 保持期間：診断完了から7日間</li>
                  <li>• 自動削除：期限到来時にJavaScriptで自動削除</li>
                  <li>• 手動削除：お客様による即座削除機能も提供</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">サーバーサイド（管理者DB）</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 個人識別情報：30日間保持後自動匿名化</li>
                  <li>• 統計用データ：匿名化後永続保持</li>
                  <li>• 削除ログ：削除実行の証跡として1年間保持</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-light-fg mb-3">4.2 お客様による削除権</h3>
            <p className="text-light-fg-muted mb-3">
              お客様はいつでも以下の方法で個人情報の削除を要求できます：
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">1</span>
                </span>
                <span className="text-light-fg-muted">診断結果画面の「データを削除する」ボタンをクリック</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">2</span>
                </span>
                <span className="text-light-fg-muted">お問い合わせフォームから削除要求を送信</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-600 text-sm font-bold">3</span>
                </span>
                <span className="text-light-fg-muted">メール（privacy@cocosil.example.com）にて直接要求</span>
              </li>
            </ul>
            <p className="text-sm text-light-fg-muted mt-4 p-3 bg-gray-100 rounded-lg">
              <strong>即座対応</strong>：削除要求をいただいた場合、24時間以内に削除処理を実行し、完了通知をお送りします。
            </p>
          </Card>
        </div>
      </section>

      {/* 5. 第三者提供 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          5. 第三者への提供
        </h2>
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-3">基本方針：一切提供しません</h3>
          <p className="text-red-800 mb-4">
            <strong>当システムは、お客様の個人情報を第三者に提供することは一切ありません。</strong>
            以下の場合を除き、いかなる理由があっても個人情報の開示は行いません。
          </p>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">法的要請がある場合のみ</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 裁判所からの開示命令</li>
              <li>• 法執行機関からの正式な要請</li>
              <li>• 生命に関わる緊急事態での必要最小限の情報</li>
            </ul>
            <p className="text-xs text-red-700 mt-2">
              ※このような場合も、開示前にお客様への通知を行います（法的に禁止されている場合を除く）
            </p>
          </div>
        </Card>
      </section>

      {/* 6. OpenAI API連携 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          6. AI サービス（OpenAI API）との連携
        </h2>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-light-fg mb-3">6.1 連携の目的</h3>
          <p className="text-light-fg-muted mb-4">
            診断結果に基づく個別化されたアドバイス提供のため、OpenAI社のClaude AIサービスを利用しています。
          </p>
          
          <h3 className="text-lg font-semibold text-light-fg mb-3">6.2 送信される情報</h3>
          <ul className="space-y-2 text-light-fg-muted mb-4">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>診断結果（体癖タイプ、MBTIタイプ、算命学結果）</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>お客様からの相談内容</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>送信されない情報</strong>：名前、メールアドレス、生年月日</span>
            </li>
          </ul>
          
          <h3 className="text-lg font-semibold text-light-fg mb-3">6.3 OpenAI社のプライバシー保護</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• OpenAI社は送信されたデータをAIモデルの学習に使用しません</li>
              <li>• 会話履歴は30日後に自動削除されます</li>
              <li>• 送信時はすべてHTTPS暗号化通信で保護</li>
              <li>• OpenAI社のプライバシーポリシーに準拠した取り扱い</li>
            </ul>
          </div>
        </Card>
      </section>

      {/* 7. お客様の権利 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          7. お客様の権利
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-fg mb-2">閲覧権</h3>
            <p className="text-sm text-light-fg-muted">
              保存されている個人情報の内容を確認する権利
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-fg mb-2">訂正権</h3>
            <p className="text-sm text-light-fg-muted">
              間違った情報の修正を要求する権利
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-semibold text-light-fg mb-2">削除権</h3>
            <p className="text-sm text-light-fg-muted">
              個人情報の削除を要求する権利
            </p>
          </Card>
        </div>
      </section>

      {/* 8. お問い合わせ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          8. お問い合わせ
        </h2>
        <Card className="p-6">
          <p className="text-light-fg-muted mb-4">
            プライバシーに関するご質問やご要望は、以下の方法でお気軽にお問い合わせください。
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-light-fg">メール</h3>
                <p className="text-brand-600">privacy@cocosil.example.com</p>
                <p className="text-sm text-light-fg-muted">24時間以内に返信いたします</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-light-fg">対応時間</h3>
                <p className="text-light-fg-muted">平日 9:00-18:00（土日祝日を除く）</p>
                <p className="text-sm text-light-fg-muted">緊急の削除要求は24時間対応</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 9. ポリシーの変更 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-light-fg border-b-2 border-brand-500 pb-2">
          9. プライバシーポリシーの変更
        </h2>
        <Card className="p-6">
          <p className="text-light-fg-muted mb-4">
            本ポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更する場合があります。
          </p>
          <ul className="space-y-2 text-light-fg-muted">
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>重要な変更については、サイト上で30日前に予告します</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>変更内容は本ページにて最新版を公開します</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>継続利用により、変更後のポリシーに同意したものとみなします</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* 同意確認・戻るボタン */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          前のページに戻る
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            // プライバシーポリシーを確認したことをlocalStorageに記録
            localStorage.setItem('privacy_policy_acknowledged', new Date().toISOString());
            window.history.back();
          }}
        >
          内容を確認しました
        </Button>
      </div>

      {/* フッター */}
      <div className="text-center text-sm text-light-fg-muted pt-8 border-t">
        <p>COCOSiL（ココシル）プライバシーポリシー</p>
        <p>最終更新日：2025年1月15日</p>
      </div>
    </div>
  );
}