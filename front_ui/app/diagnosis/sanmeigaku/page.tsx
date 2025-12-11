"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MessageCircle, Share2, Download, Sparkles, TrendingUp, Users, Heart } from "lucide-react"

export default function SanmeigakuResultPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // サンプルデータ
  const result = {
    type: "天貴星",
    element: "木性",
    description: "理想を追求し、高い目標に向かって努力する性格です。",
    strengths: ["理想主義", "向上心が強い", "リーダーシップ", "創造性"],
    weaknesses: ["完璧主義", "現実離れしやすい", "プライドが高い", "孤独を感じやすい"],
    compatibility: {
      good: ["天報星", "天印星"],
      challenging: ["天極星", "天南星"],
    },
    advice: [
      "理想と現実のバランスを取ることを意識しましょう",
      "他者の意見にも耳を傾けることで、より良い結果が得られます",
      "完璧を求めすぎず、プロセスを楽しむことも大切です",
    ],
    scores: {
      creativity: 85,
      leadership: 78,
      communication: 65,
      stability: 55,
      flexibility: 70,
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">ホームに戻る</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              共有
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        {/* Result Header */}
        <Card className="p-6 md:p-8 mb-6 bg-gradient-to-br from-cyan-500 to-purple-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-3">算命学診断</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{result.type}</h1>
              <p className="text-lg text-white/90">{result.element}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <p className="text-lg leading-relaxed">{result.description}</p>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent">
            <TabsTrigger value="overview" className="h-12 data-[state=active]:bg-white data-[state=active]:shadow-md">
              概要
            </TabsTrigger>
            <TabsTrigger value="strengths" className="h-12 data-[state=active]:bg-white data-[state=active]:shadow-md">
              強み・弱み
            </TabsTrigger>
            <TabsTrigger
              value="compatibility"
              className="h-12 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              相性
            </TabsTrigger>
            <TabsTrigger value="advice" className="h-12 data-[state=active]:bg-white data-[state=active]:shadow-md">
              アドバイス
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-500" />
                性格特性スコア
              </h2>
              <div className="space-y-4">
                {Object.entries(result.scores).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    creativity: "創造性",
                    leadership: "リーダーシップ",
                    communication: "コミュニケーション",
                    stability: "安定性",
                    flexibility: "柔軟性",
                  }
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{labels[key]}</span>
                        <span className="font-bold text-cyan-600">{value}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
              <h3 className="text-xl font-bold text-slate-900 mb-3">あなたの特徴</h3>
              <p className="text-slate-700 leading-relaxed">
                {result.type}
                の方は、高い理想を持ち、それに向かって努力を惜しまない性格です。創造性とリーダーシップに優れており、新しいアイデアを生み出す能力に長けています。一方で、完璧主義的な傾向があり、時に現実とのギャップに悩むこともあります。
              </p>
            </Card>
          </TabsContent>

          {/* Strengths Tab */}
          <TabsContent value="strengths" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-500" />
                  強み
                </h2>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-cyan-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-slate-700 leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  成長ポイント
                </h2>
                <ul className="space-y-3">
                  {result.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-slate-700 leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </TabsContent>

          {/* Compatibility Tab */}
          <TabsContent value="compatibility" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  相性の良いタイプ
                </h2>
                <div className="space-y-3">
                  {result.compatibility.good.map((type, index) => (
                    <div key={index} className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                      <h3 className="font-bold text-slate-900 mb-1">{type}</h3>
                      <p className="text-sm text-slate-600">お互いの長所を引き出し合える関係です</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-orange-500" />
                  注意が必要なタイプ
                </h2>
                <div className="space-y-3">
                  {result.compatibility.challenging.map((type, index) => (
                    <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h3 className="font-bold text-slate-900 mb-1">{type}</h3>
                      <p className="text-sm text-slate-600">理解し合うために努力が必要な関係です</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Advice Tab */}
          <TabsContent value="advice" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">あなたへのアドバイス</h2>
              <div className="space-y-4">
                {result.advice.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 leading-relaxed flex-1">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-cyan-500 to-purple-500 text-white border-0">
              <h3 className="text-xl font-bold mb-3">さらに詳しく知りたい方へ</h3>
              <p className="mb-4 leading-relaxed">
                AIアシスタントがあなたの診断結果について、より詳しく解説します。気になることを何でも質問してください。
              </p>
              <Button asChild className="bg-white text-cyan-600 hover:bg-slate-100 h-12">
                <Link href="/home/chat">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AIに相談する
                </Link>
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
