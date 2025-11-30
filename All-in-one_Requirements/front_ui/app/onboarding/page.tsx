"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    displayName: "",
    birthDate: "",
    purpose: "",
    notifications: true,
    dataSharing: false,
  })

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    console.log("[v0] Onboarding data:", formData)
    window.location.href = "/home"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
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
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl p-6 md:p-8 shadow-xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      i < step
                        ? "bg-cyan-500 text-white"
                        : i === step
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i}
                  </div>
                  {i < totalSteps && (
                    <div className={`flex-1 h-1 mx-2 transition-colors ${i < step ? "bg-cyan-500" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs md:text-sm text-slate-600">
              <span>基本情報</span>
              <span>診断の目的</span>
              <span>プライバシー</span>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">基本情報を入力してください</h2>
                <p className="text-slate-600">より正確な診断のために、あなたの情報を教えてください</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="displayName" className="text-base font-medium">
                    ニックネーム <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500 mt-1 mb-2">AIがあなたを呼ぶ時に使用します</p>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="例: 山田太郎"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate" className="text-base font-medium">
                    生年月日 <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500 mt-1 mb-2">算命学診断に使用されます</p>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Purpose */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">診断の目的を教えてください</h2>
                <p className="text-slate-600">あなたに最適な診断をおすすめします</p>
              </div>

              <RadioGroup
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer">
                  <RadioGroupItem value="self-understanding" id="self" className="mt-1" />
                  <Label htmlFor="self" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">自己理解を深めたい</div>
                    <div className="text-sm text-slate-600 mt-1">自分の性格や強み・弱みを知りたい</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer">
                  <RadioGroupItem value="relationships" id="relationships" className="mt-1" />
                  <Label htmlFor="relationships" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">人間関係を改善したい</div>
                    <div className="text-sm text-slate-600 mt-1">他者との関わり方を学びたい</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer">
                  <RadioGroupItem value="career" id="career" className="mt-1" />
                  <Label htmlFor="career" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">キャリア開発</div>
                    <div className="text-sm text-slate-600 mt-1">適職や仕事での強みを知りたい</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer">
                  <RadioGroupItem value="growth" id="growth" className="mt-1" />
                  <Label htmlFor="growth" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">自己成長</div>
                    <div className="text-sm text-slate-600 mt-1">成長のための課題を見つけたい</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer">
                  <RadioGroupItem value="entertainment" id="entertainment" className="mt-1" />
                  <Label htmlFor="entertainment" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">楽しみたい</div>
                    <div className="text-sm text-slate-600 mt-1">気軽に診断を楽しみたい</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Privacy Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">プライバシー設定</h2>
                <p className="text-slate-600">あなたのデータの取り扱いについて設定してください</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200">
                  <Checkbox
                    id="notifications"
                    checked={formData.notifications}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked as boolean })}
                    className="mt-1"
                  />
                  <Label htmlFor="notifications" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">診断結果の通知を受け取る</div>
                    <div className="text-sm text-slate-600 mt-1">新しい診断結果やおすすめの診断について通知します</div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200">
                  <Checkbox
                    id="dataSharing"
                    checked={formData.dataSharing}
                    onCheckedChange={(checked) => setFormData({ ...formData, dataSharing: checked as boolean })}
                    className="mt-1"
                  />
                  <Label htmlFor="dataSharing" className="cursor-pointer flex-1">
                    <div className="font-semibold text-slate-900">匿名データの研究利用に協力する</div>
                    <div className="text-sm text-slate-600 mt-1">
                      個人を特定できない形で、診断精度向上のための研究に協力します
                    </div>
                  </Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">プライバシーについて</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• あなたの個人情報は厳重に保護されます</li>
                    <li>• 診断データは暗号化されて保存されます</li>
                    <li>• 第三者への情報提供は行いません</li>
                    <li>• いつでも設定を変更できます</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="h-12 px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.displayName || !formData.birthDate)) || (step === 2 && !formData.purpose)
                }
                className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                次へ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-white">
                完了
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
