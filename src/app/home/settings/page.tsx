"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Bell, Shield, Trash2, ChevronRight } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)

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
          <h1 className="text-lg font-semibold text-slate-900">設定</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 max-w-3xl mx-auto space-y-6">
        {/* Profile Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              プロフィール
            </CardTitle>
            <CardDescription>アカウント情報を管理します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-400 text-white text-2xl">
                  山
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  画像を変更
                </Button>
                <p className="text-xs text-slate-500">JPG、PNG形式、5MB以下</p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">ニックネーム</Label>
                <Input id="nickname" defaultValue="山田太郎" className="min-h-[44px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" type="email" defaultValue="yamada@example.com" className="min-h-[44px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">生年月日</Label>
                <Input id="birthdate" type="date" defaultValue="1985-06-15" className="min-h-[44px]" />
              </div>

              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">プロフィールを更新</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              セキュリティ
            </CardTitle>
            <CardDescription>パスワードとアカウントのセキュリティ設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">パスワード</p>
                <p className="text-sm text-slate-500">最終更新: 2025-10-15</p>
              </div>
              <Button variant="outline" size="sm">
                変更
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">二段階認証</p>
                <p className="text-sm text-slate-500">アカウントのセキュリティを強化</p>
              </div>
              <Button variant="outline" size="sm">
                設定
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知設定
            </CardTitle>
            <CardDescription>通知の受け取り方法を管理します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">プッシュ通知</p>
                <p className="text-sm text-slate-500">新しい診断結果やメッセージを通知</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <p className="font-medium text-slate-900">メール通知</p>
                <p className="text-sm text-slate-500">更新情報をメールで受け取る</p>
              </div>
              <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              プライバシー
            </CardTitle>
            <CardDescription>データとプライバシーの設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/privacy"
              className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <p className="font-medium text-slate-900">プライバシーポリシー</p>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Separator />

            <Link
              href="/terms"
              className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <p className="font-medium text-slate-900">利用規約</p>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>

            <Separator />

            <button className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors w-full text-left">
              <p className="font-medium text-slate-900">データをダウンロード</p>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              危険な操作
            </CardTitle>
            <CardDescription>以下の操作は取り消せません</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full">
              アカウントを削除
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
