import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, User, PawPrint, Plus, Edit, Trash2 } from "lucide-react"

export default function DiagnosisPage() {
  const diagnoses = [
    {
      id: 1,
      icon: <PawPrint className="w-6 h-6" />,
      name: "動物占い",
      type: "fortune",
      result: "落ち着きのあるペガサス",
      status: "完了",
      date: "2025-11-05",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: 2,
      icon: <Calendar className="w-6 h-6" />,
      name: "星座占い",
      type: "fortune",
      result: "蟹座",
      status: "完了",
      date: "2025-11-05",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      icon: <Brain className="w-6 h-6" />,
      name: "MBTI",
      type: "mbti",
      result: "INFP",
      status: "完了",
      date: "2025-11-04",
      color: "from-green-500 to-teal-500",
    },
    {
      id: 4,
      icon: <User className="w-6 h-6" />,
      name: "体癖論",
      type: "taiheki",
      result: "未実施",
      status: "未実施",
      date: null,
      color: "from-gray-400 to-gray-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COCOSiL_logo-BelQPpdgzJD6lZakvmb2wF6zfy53IM.png"
              alt="COCOSiL"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-slate-900">
              COCO<span className="text-cyan-500">SiL</span>
            </span>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">診断管理</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-8">
        {/* Add New Diagnosis Section */}
        <Card className="shadow-md border-2 border-dashed border-cyan-300 bg-cyan-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700">
              <Plus className="w-5 h-5" />
              新しい診断を追加
            </CardTitle>
            <CardDescription>さらに詳しく自分を知るために、他の診断を追加できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent">
                <Brain className="w-6 h-6 text-purple-500" />
                <span className="text-sm">MBTI</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent">
                <User className="w-6 h-6 text-green-500" />
                <span className="text-sm">体癖論</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent">
                <Calendar className="w-6 h-6 text-orange-500" />
                <span className="text-sm">Big5</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent">
                <PawPrint className="w-6 h-6 text-pink-500" />
                <span className="text-sm">その他</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Diagnoses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">診断一覧</h2>

          <div className="grid gap-4">
            {diagnoses.map((diagnosis) => (
              <Card key={diagnosis.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${diagnosis.color} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {diagnosis.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{diagnosis.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{diagnosis.result}</p>
                        </div>
                        <Badge variant={diagnosis.status === "完了" ? "default" : "secondary"}>
                          {diagnosis.status}
                        </Badge>
                      </div>

                      {diagnosis.date && <p className="text-xs text-slate-500 mb-3">実施日: {diagnosis.date}</p>}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {diagnosis.status === "完了" ? (
                          <>
                            <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                              <Edit className="w-4 h-4" />
                              再診断
                            </Button>
                            <Button size="sm" variant="ghost" className="gap-2 text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                              削除
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                            診断を開始
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
