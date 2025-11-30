"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  User,
  Settings,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  ClipboardList,
  BarChart3,
  Home,
} from "lucide-react"

export default function HomePage() {
  // サンプルデータ
  const recentDiagnoses = [
    {
      id: 1,
      type: "算命学診断",
      result: "天貴星",
      date: "2025-01-15",
      url: "/diagnosis/sanmeigaku",
    },
    {
      id: 2,
      type: "MBTI診断",
      result: "INFJ",
      date: "2025-01-10",
      url: "/diagnosis/mbti",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COCOSiL_logo-BelQPpdgzJD6lZakvmb2wF6zfy53IM.png"
              alt="COCOSiL"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="text-xl md:text-2xl font-bold">
              <span className="text-slate-900">COCO</span>
              <span className="text-cyan-500">SiL</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home/profile">
                <User className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">おかえりなさい</h1>
          <p className="text-slate-600">今日も自分を発見する旅を続けましょう</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/home/diagnosis">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">新しい診断</h3>
                  <p className="text-sm text-slate-600">診断を受けて自分を知る</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/home/chat">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">AIチャット</h3>
                  <p className="text-sm text-slate-600">AIに相談する</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/home/profile">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">学習プロファイル</h3>
                  <p className="text-sm text-slate-600">成長を確認する</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Recent Diagnoses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">最近の診断結果</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home/diagnosis">すべて見る</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentDiagnoses.map((diagnosis) => (
              <Card key={diagnosis.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" asChild>
                <Link href={diagnosis.url}>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className="bg-cyan-100 text-cyan-700 border-0">{diagnosis.type}</Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {diagnosis.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{diagnosis.result}</h3>
                  <p className="text-slate-600 text-sm">診断結果を確認する →</p>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <Card className="p-6 md:p-8 bg-gradient-to-br from-cyan-500 to-purple-500 text-white border-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">AIからのインサイト</h3>
              <p className="leading-relaxed mb-4">
                あなたの診断結果から、新しい気づきが見つかりました。AIチャットで詳しく聞いてみませんか?
              </p>
              <Button asChild className="bg-white text-cyan-600 hover:bg-slate-100 h-12">
                <Link href="/home/chat">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AIと話す
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-5 gap-1 relative">
            {/* Diagnosis Management */}
            <Link
              href="/home/diagnosis"
              className="flex flex-col items-center justify-center py-3 px-2 text-slate-600 hover:text-cyan-500 transition-colors min-h-[60px]"
            >
              <ClipboardList className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">診断管理</span>
            </Link>

            {/* AI Chat */}
            <Link
              href="/home/chat"
              className="flex flex-col items-center justify-center py-3 px-2 text-slate-600 hover:text-cyan-500 transition-colors min-h-[60px]"
            >
              <MessageCircle className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">AIチャット</span>
            </Link>

            {/* Home Button - Centered and Circular */}
            <Link
              href="/home"
              className="flex flex-col items-center justify-center relative"
              style={{ marginTop: "-20px" }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <Home className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-medium text-center text-slate-600 mt-1">ホーム</span>
            </Link>

            {/* Diagnosis Results */}
            <Link
              href="/home/results"
              className="flex flex-col items-center justify-center py-3 px-2 text-slate-600 hover:text-cyan-500 transition-colors min-h-[60px]"
            >
              <BarChart3 className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">診断結果</span>
            </Link>

            {/* Account */}
            <Link
              href="/home/settings"
              className="flex flex-col items-center justify-center py-3 px-2 text-slate-600 hover:text-cyan-500 transition-colors min-h-[60px]"
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium text-center">アカウント</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
