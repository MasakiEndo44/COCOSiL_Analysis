import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COCOSiL_logo-BelQPpdgzJD6lZakvmb2wF6zfy53IM.png"
              alt="COCOSiL"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-semibold">新規登録</CardTitle>
          <CardDescription className="text-base">診断を始めるにはアカウント作成が必要です</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Googleログインボタン */}
          <Button variant="outline" size="lg" className="w-full min-h-[48px] border-2 hover:bg-slate-50 bg-transparent">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleで登録
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              または
            </span>
          </div>

          {/* メール登録フォーム */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium">
                ニックネーム <span className="text-destructive">*</span>
              </Label>
              <Input id="nickname" type="text" placeholder="山田太郎" className="min-h-[44px]" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                メールアドレス <span className="text-destructive">*</span>
              </Label>
              <Input id="email" type="email" placeholder="example@mail.com" className="min-h-[44px]" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                パスワード <span className="text-destructive">*</span>
              </Label>
              <Input id="password" type="password" placeholder="••••••••" className="min-h-[44px]" required />
              <p className="text-xs text-muted-foreground">8文字以上で設定してください</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                生年月日 <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="年" className="min-h-[44px]" min="1900" max="2024" required />
                <Input type="number" placeholder="月" className="min-h-[44px]" min="1" max="12" required />
                <Input type="number" placeholder="日" className="min-h-[44px]" min="1" max="31" required />
              </div>
              <p className="text-xs text-muted-foreground">診断に使用します</p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-1" required />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                <Link href="/terms" className="text-[rgb(var(--brand-500))] hover:underline">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="text-[rgb(var(--brand-500))] hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full min-h-[48px] bg-[rgb(var(--brand-500))] hover:bg-[rgb(var(--brand-700))] text-white font-medium"
            >
              登録して診断を開始
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/sign-in" className="text-[rgb(var(--brand-500))] hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
