"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "こんにちは！診断結果を基に、あなたの性格について話しましょう。何か質問はありますか?",
      timestamp: "14:30",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "ご質問ありがとうございます。あなたのINFPタイプの特徴から考えると...",
        timestamp: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
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
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">AIチャット</h1>
            <Badge variant="secondary" className="text-xs">
              今月: 3/10回
            </Badge>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
        {messages.map((message) => {
          const isAssistant = message.role === "assistant"

          return (
            <div key={message.id} className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
              {isAssistant && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COCOSiL_logo-BelQPpdgzJD6lZakvmb2wF6zfy53IM.png" />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-purple-400">
                    <Sparkles className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3",
                  isAssistant
                    ? "bg-white border border-gray-200 shadow-sm"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={cn("text-xs mt-2", isAssistant ? "text-slate-500" : "text-cyan-100")}>
                  {message.timestamp}
                </p>
              </div>

              {!isAssistant && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                    山
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 min-h-[44px]"
          />
          <Button onClick={handleSend} className="bg-cyan-500 hover:bg-cyan-600 text-white min-w-[44px] px-6" size="lg">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
