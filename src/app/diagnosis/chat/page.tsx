'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { Button } from '@/ui/components/ui/button';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface ConsultationTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const consultationTopics: ConsultationTopic[] = [
  {
    id: 'relationship',
    title: '人間関係の悩み',
    description: '職場、友人、恋愛などの人間関係について',
    icon: '👥'
  },
  {
    id: 'career',
    title: 'キャリア・仕事の悩み',
    description: '転職、昇進、働き方などについて',
    icon: '💼'
  },
  {
    id: 'personality',
    title: '自分の性格・特性理解',
    description: 'あなたの特性を深く理解したい',
    icon: '🧠'
  },
  {
    id: 'future',
    title: '将来・目標設定',
    description: '人生設計や目標達成について',
    icon: '🎯'
  }
];

export default function ChatPage() {
  const router = useRouter();
  const { getUserData, setCurrentStep } = useDiagnosisStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'topic_selection' | 'consultation' | 'summary'>('topic_selection');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const userData = getUserData();

  useEffect(() => {
    // 診断データが不完全な場合は診断ページに戻す
    if (!userData || !userData.basic || !userData.mbti || !userData.taiheki) {
      router.push('/diagnosis');
      return;
    }

    setCurrentStep('integration');
    
    // 初期メッセージを設定
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `こんにちは、${userData.basic.name}さん！診断結果を基にご相談をお受けします。\n\nあなたの診断結果：\n• MBTI：${userData.mbti.type}\n• 体癖：${userData.taiheki.primary}種（主体癖）\n• 動物占い：${userData.fortune?.animal}\n• 算命学：${userData.fortune?.six_star}\n\nどのようなことについてお聞かせいただけますか？`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  }, [userData, router, setCurrentStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setConversationPhase('consultation');
    
    const topic = consultationTopics.find(t => t.id === topicId);
    if (topic) {
      const topicMessage: ChatMessage = {
        id: `topic-${topicId}`,
        role: 'user',
        content: `「${topic.title}」について相談したいです。`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, topicMessage]);
      
      // AIの初期質問を送信
      generateAIResponse(`ユーザーが「${topic.title}」について相談したいとのことです。診断結果を踏まえて、具体的なヒアリングを開始してください。`);
    }
  };

  const generateAIResponse = async (userMessage: string) => {
    if (!userData) return;

    setIsStreaming(true);
    
    try {
      // AbortControllerを作成
      abortControllerRef.current = new AbortController();
      
      const systemPrompt = `
あなたはCOCOSiL診断システムのAI相談員です。以下の診断結果を持つ方の相談に乗ってください：

## 診断データ
- 年齢: ${userData.basic.age}歳
- MBTI: ${userData.mbti?.type}
- 体癖: 主体癖${userData.taiheki?.primary}種・副体癖${userData.taiheki?.secondary}種
- 動物占い: ${userData.fortune?.animal}
- 算命学: ${userData.fortune?.six_star}

## 相談方針
1. 診断結果を統合した個別化アドバイス
2. 実用的で具体的な改善提案
3. ユーザーの自律性を重視
4. 医療的判断は一切行わない
5. 温かく共感的な態度で対応

前回までの会話を踏まえて、自然な対話を続けてください。
`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('AI応答の取得に失敗しました');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ストリーミングの初期化に失敗しました');

      const aiMessageId = `ai-${Date.now()}`;
      let aiContent = '';

      // AIメッセージを初期化
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // ストリーミング処理
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                aiContent += content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: aiContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // パースエラーは無視
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // ユーザーがキャンセル
      }
      
      console.error('AI応答エラー:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '申し訳ございませんが、応答の生成中にエラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = currentInput.trim();
    setCurrentInput('');

    // AI応答を生成
    await generateAIResponse(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndConsultation = () => {
    setConversationPhase('summary');
    router.push('/diagnosis/results');
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">診断データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">AIカウンセリング</h1>
            <p className="text-sm text-muted-foreground">診断結果を基にした個別相談</p>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleEndConsultation}
            size="sm"
          >
            相談終了
          </Button>
        </div>
      </div>

      {/* Topic Selection */}
      {conversationPhase === 'topic_selection' && (
        <div className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">相談内容をお選びください</h2>
              <p className="text-muted-foreground">あなたの診断結果を踏まえて、最適なアドバイスをいたします</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultationTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className="p-6 bg-white rounded-lg border border-border hover:border-brand-500 transition-all text-left"
                >
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">{topic.icon}</span>
                    <h3 className="font-semibold text-foreground">{topic.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {conversationPhase === 'consultation' && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-brand-500 text-white'
                        : 'bg-white text-foreground border border-border'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="bg-white border-t border-border p-4">
            <div className="max-w-3xl mx-auto flex space-x-4">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力してください..."
                className="flex-1 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                rows={3}
                disabled={isStreaming}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isStreaming}
                className="px-6"
              >
                送信
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}