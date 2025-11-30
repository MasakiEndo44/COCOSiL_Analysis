"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, DramaIcon, Brain, Zap, User, Sparkles, Rabbit } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/design-mode/COCOSiL_logo(1).png"
              alt="COCOSiL Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-semibold text-lg md:text-xl">
              <span className="text-slate-900">COCO</span>
              <span className="text-cyan-500">SiL</span>
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" className="text-slate-700" asChild>
              <Link href="/sign-in">ログイン</Link>
            </Button>
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white" asChild>
              <Link href="/sign-up">無料登録</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="px-4 py-12 md:py-20 md:px-6 max-w-7xl mx-auto">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="flex justify-center mb-8">
              <Image
                src="/images/design-mode/COCOSiL_logo(1).png"
                alt="COCOSiL"
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32 animate-pulse"
              />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              あなたの本質を、
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                AIと共に見つける
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              生年月日を入力するだけで、複数の診断があなたの性格を多角的に分析します。
              <br className="hidden md:inline" />
              AIによる超精密診断で、本当の自分を発見しましょう。
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center pt-4">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white min-h-[44px] px-8">
                今すぐ診断を始める
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300 min-h-[44px] px-8 bg-transparent">
                詳しく知る
              </Button>
            </div>
          </div>
        </section>

        {/* Diagnosis Cards Grid */}
        <section className="px-4 py-12 md:py-16 md:px-6 max-w-7xl mx-auto relative">
          {/* Decorative logos */}
          <div className="absolute top-0 left-4 opacity-10 hidden lg:block"></div>
          <div className="absolute top-0 right-4 opacity-10 hidden lg:block"></div>

          <div className="text-center mb-12 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Image
                src="/images/design-mode/COCOSiL_logo(1).png"
                alt="COCOSiL"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">複数の診断で多角的に分析</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">例えば、こんな診断が利用できます</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Card 1: 体癖論 */}
            <DiagnosisCard
              icon={<User className="w-16 h-16" />}
              title="体癖論"
              description="体格と性格の関係から分析"
              color="from-cyan-400 to-blue-500"
            />

            {/* Card 2: MBTI */}
            <DiagnosisCard
              icon={<DramaIcon className="w-16 h-16" />}
              title="MBTI"
              description="心理学的な性格分類"
              color="from-purple-400 to-pink-500"
            />

            {/* Card 3: 星座占い */}
            <DiagnosisCard
              icon={<Sparkles className="w-16 h-16" />}
              title="星座占い"
              description="西洋の運命占術"
              color="from-cyan-300 to-teal-500"
            />

            {/* Card 4: 動物占い */}
            <DiagnosisCard
              icon={<Rabbit className="w-16 h-16" />}
              title="どうぶつ占い"
              description="12の動物で性格を分類"
              color="from-yellow-400 to-orange-500"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-12 md:py-16 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AIが学習"
              description="チャットを重ねるごとに、あなたへの理解が深まります"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="瞬時に診断"
              description="生年月日を入力するだけで、複数の診断が即座に完了"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="プライバシー重視"
              description="データは厳格に管理され、いつでも削除可能です"
            />
          </div>
        </section>

        {/* Bottom Features */}
        <section className="px-4 py-12 md:py-16 md:px-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-slate-200">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">COCOSiLでできること</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center space-y-3">
                <div className="text-4xl">📊</div>
                <h3 className="font-semibold text-slate-900">診断結果の管理</h3>
                <p className="text-sm text-slate-600">複数の診断結果を一元管理し、いつでも確認できます</p>
              </div>

              <div className="text-center space-y-3">
                <div className="text-4xl">💬</div>
                <h3 className="font-semibold text-slate-900">AIとの対話</h3>
                <p className="text-sm text-slate-600">あなたの性格について、AIが深い洞察を提供します</p>
              </div>

              <div className="text-center space-y-3">
                <div className="text-4xl">📈</div>
                <h3 className="font-semibold text-slate-900">自己理解の深化</h3>
                <p className="text-sm text-slate-600">成長に必要な気づきと、新しい視点を発見できます</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 md:py-20 md:px-6 max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/design-mode/COCOSiL_logo(1).png"
              alt="COCOSiL"
              width={80}
              height={80}
              className="w-20 h-20"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">あなたの本質を発見しましょう</h2>
          <p className="text-lg text-slate-600">今すぐ無料で診断を始めて、本当の自分に出会う旅を始めます</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white min-h-[48px] px-12"
          >
            無料で診断を始める
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-6">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/design-mode/COCOSiL_logo(1).png"
              alt="COCOSiL"
              width={60}
              height={60}
              className="w-15 h-15"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">サービス</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    診断について
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    AIについて
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">ヘルプ</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    お問い合わせ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">法務</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    利用規約
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    プライバシー
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">フォロー</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-500">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            <p>© 2025 COCOSiL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DiagnosisCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
      <div className={`h-32 bg-gradient-to-br ${color} opacity-80 flex items-center justify-center`}>
        <div className="text-white group-hover:scale-110 transition-transform duration-300">{icon}</div>
      </div>
      <div className="p-6 space-y-2">
        <h3 className="font-semibold text-slate-900 text-center text-2xl">{title}</h3>
        <p className="text-sm text-slate-600 text-center">{description}</p>
      </div>
    </Card>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-purple-100 flex items-center justify-center mx-auto text-cyan-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}
