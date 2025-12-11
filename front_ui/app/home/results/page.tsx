import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, User, PawPrint, ChevronRight, FileText } from "lucide-react"

export default function ResultsPage() {
  const results = [
    {
      id: 1,
      category: "動物占い・星座占い",
      diagnoses: [
        {
          icon: <PawPrint className="w-5 h-5" />,
          name: "動物占い",
          result: "落ち着きのあるペガサス",
          color: "from-cyan-500 to-blue-500",
          link: "/diagnosis/sanmeigaku",
        },
        {
          icon: <Calendar className="w-5 h-5" />,
          name: "星座占い",
          result: "蟹座",
          color: "from-purple-500 to-pink-500",
          link: "/diagnosis/sanmeigaku",
        },
      ],
    },
    {
      id: 2,
      category: "性格診断",
      diagnoses: [
        {
          icon: <Brain className="w-5 h-5" />,
          name: "MBTI",
          result: "INFP - 仲介者",
          color: "from-green-500 to-teal-500",
          link: "/diagnosis/mbti",
        },
      ],
    },
    {
      id: 3,
      category: "体質・気質",
      diagnoses: [
        {
          icon: <User className="w-5 h-5" />,
          name: "体癖論",
          result: "未実施",
          color: "from-gray-400 to-gray-500",
          link: null,
        },
      ],
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
          <h1 className="text-lg font-semibold text-slate-900">診断結果</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-8">
        {/* Summary Card */}
        <Card className="shadow-lg bg-gradient-to-br from-white to-cyan-50 border-2 border-cyan-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-cyan-600" />
              <CardTitle className="text-cyan-900">診断サマリー</CardTitle>
            </div>
            <CardDescription>あなたの診断結果の概要です</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-slate-600">完了した診断</p>
                <p className="text-3xl font-bold text-slate-900">3</p>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-slate-600">未実施の診断</p>
                <p className="text-3xl font-bold text-slate-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results by Category */}
        <div className="space-y-6">
          {results.map((category) => (
            <div key={category.id} className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">{category.category}</h2>

              <div className="grid gap-3">
                {category.diagnoses.map((diagnosis, index) => (
                  <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${diagnosis.color} flex items-center justify-center text-white flex-shrink-0`}
                          >
                            {diagnosis.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{diagnosis.name}</h3>
                            <p
                              className={cn(
                                "text-sm",
                                diagnosis.result === "未実施" ? "text-slate-500" : "text-slate-700",
                              )}
                            >
                              {diagnosis.result}
                            </p>
                          </div>
                        </div>

                        {/* Action */}
                        {diagnosis.link ? (
                          <Link href={diagnosis.link}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              詳細
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Badge variant="secondary">未実施</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Export Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">結果のエクスポート</CardTitle>
            <CardDescription>診断結果をPDFやCSV形式でダウンロードできます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                PDFでダウンロード
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                CSVでダウンロード
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
