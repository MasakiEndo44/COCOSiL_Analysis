'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import type { ChatSession } from '@/types';
import { generateSessionId } from '@/lib/utils';
import { Button } from '@/ui/components/ui/button';
import { UserDiagnosisData } from '@/types';
import { optimizeMessagesForStorage, estimateConversationMemoryUsage } from '@/lib/chat/conversation-utils';
import { GuidanceOverlay } from '@/ui/components/overlays/guidance-overlay';
import { CompletionMessage } from '@/ui/components/chat/completion-message';

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
  const {
    getUserData,
    setCurrentStep,
    setChatSession,
    setChatSummary,
    markCounselingCompleted,
    overlayHints,
    markOverlaySeen
  } = useDiagnosisStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [_selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conversationPhase, setConversationPhase] = useState<'topic_selection' | 'consultation' | 'summary'>('topic_selection');
  const [userData, setUserData] = useState<UserDiagnosisData | null>(null);
  const [chatSession, setChatSessionLocal] = useState<ChatSession | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Completion detection state
  const [completionDetection, setCompletionDetection] = useState<{
    resolved: boolean;
    confidence: number;
    nextAction: string;
    shouldShowContinueButton: boolean;
  } | null>(null);

  // Overlay state management
  const [showChatOverlay, setShowChatOverlay] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // 初期化が既に実行されている場合は何もしない
    if (initializedRef.current) return;

    const data = getUserData();

    // Debug: Check Zustand store state
    console.log('🏪 Zustand Store Debug:', {
      hasData: !!data,
      storeState: {
        sessionId: useDiagnosisStore.getState().sessionId,
        basicInfo: !!useDiagnosisStore.getState().basicInfo,
        mbti: !!useDiagnosisStore.getState().mbti,
        taiheki: !!useDiagnosisStore.getState().taiheki,
        fortune: !!useDiagnosisStore.getState().fortune,
        currentStep: useDiagnosisStore.getState().currentStep,
        progress: useDiagnosisStore.getState().progress
      },
      getUserDataResult: data ? {
        hasId: !!data.id,
        hasBasic: !!data.basic,
        hasMbti: !!data.mbti,
        hasTaiheki: !!data.taiheki,
        hasFortune: !!data.fortune
      } : null
    });

    // 診断データが不完全な場合は診断ページに戻す
    if (!data || !data.basic || !data.mbti || !data.taiheki) {
      console.log('❌ Redirecting to diagnosis page due to incomplete data');
      router.push('/diagnosis');
      return;
    }

    // 初期化フラグを設定
    initializedRef.current = true;

    // userDataを設定
    setUserData(data);

    setCurrentStep('integration');

    // 初期メッセージを設定
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `こんにちは、${data.basic.name}さん！診断結果を基にご相談をお受けします。\n\nあなたの診断結果：\n• MBTI：${data.mbti.type}\n• 体癖：${data.taiheki.primary}種（主体癖）\n• 動物占い：${data.fortune?.animal}\n• 算命学：${data.fortune?.sixStar}\n\nどのようなことについてお聞かせいただけますか？`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  }, [getUserData, router, setCurrentStep]); // Include dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mounting state for SSR
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Show chat overlay on initial load if not seen before
  useEffect(() => {
    if (hasMounted && userData && !overlayHints.chatIntroSeen) {
      setShowChatOverlay(true);
    }
  }, [hasMounted, userData, overlayHints.chatIntroSeen]);

  // Chat overlay content and handlers
  const chatOverlayContent = {
    title: 'AIチャットについて',
    body: 'AIカウンセラーとの相談を始めます。いつでも何度でも相談していただけます。十分だと感じたら画面下の「相談終了」ボタンを押してください。',
    primaryAction: {
      label: '相談を始める',
      onClick: () => {
        setShowChatOverlay(false);
        markOverlaySeen('chat');
      },
      variant: 'primary' as const,
      'data-testid': 'chat-overlay-start-action'
    }
  };

  const handleChatOverlayClose = () => {
    setShowChatOverlay(false);
    markOverlaySeen('chat');
  };

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

      // Initialize chat session
      const session: ChatSession = {
        sessionId: generateSessionId(),
        selectedTopic: topicId,
        messages: [...messages, topicMessage],
        startTime: new Date(),
        isCompleted: false
      };
      setChatSessionLocal(session);

      setMessages(prev => [...prev, topicMessage]);

      // AIの初期質問を送信
      generateAIResponse(`ユーザーが「${topic.title}」について相談したいとのことです。診断結果を踏まえて、具体的なヒアリングを開始してください。`);
    }
  };

  /**
   * Handle continue button click from CompletionMessage
   * Resets completion detection state to allow conversation to continue
   */
  const handleContinueChat = () => {
    setCompletionDetection(null);
    console.log('[CompletionDetection] User chose to continue conversation');
  };

  const generateAIResponse = async (userMessage: string) => {
    if (!userData) return;

    setIsStreaming(true);

    try {
      // AbortControllerを作成
      abortControllerRef.current = new AbortController();

      // Debug: Check userData before sending
      console.log('🔍 Frontend Debug - userData before API call:', {
        hasUserData: !!userData,
        basicInfo: userData?.basic ? {
          hasName: !!userData.basic.name,
          hasAge: !!userData.basic.age,
          hasEmail: !!userData.basic.email
        } : null,
        mbti: userData?.mbti ? {
          hasType: !!userData.mbti.type,
          type: userData.mbti.type
        } : null,
        taiheki: userData?.taiheki ? {
          hasPrimary: !!userData.taiheki.primary,
          primary: userData.taiheki.primary
        } : null,
        fortune: userData?.fortune ? {
          hasAnimal: !!userData.fortune.animal,
          animal: userData.fortune.animal
        } : null
      });

      // IntegratedPromptEngine handles system prompt generation
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          userData: userData,
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

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];

        // Update session with AI message
        if (chatSession) {
          setChatSessionLocal({
            ...chatSession,
            messages: newMessages
          });
        }

        return newMessages;
      });

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

              // Handle metadata (safetyData, choiceQuestion, completionDetection)
              if (parsed.type === 'metadata') {
                if (parsed.completionDetection) {
                  setCompletionDetection(parsed.completionDetection);
                  console.log('[CompletionDetection] Received from API:', parsed.completionDetection);
                }
                continue; // Skip to next line
              }

              // Handle content chunks
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                aiContent += content;
                setMessages(prev => {
                  const updatedMessages = prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: aiContent }
                      : msg
                  );

                  // Update session with streaming content
                  if (chatSession) {
                    setChatSessionLocal({
                      ...chatSession,
                      messages: updatedMessages
                    });
                  }

                  return updatedMessages;
                });
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

    setMessages(prev => {
      const newMessages = [...prev, userMessage];

      // Update session with new messages
      if (chatSession) {
        setChatSessionLocal({
          ...chatSession,
          messages: newMessages
        });
      }

      return newMessages;
    });

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

  /**
   * Phase 2: Enhanced session completion with IntelligentSummarizer
   */
  const handleEndConsultation = async () => {
    if (chatSession && messages.length > 2) {
      setIsSummarizing(true);

      try {
        // Performance: Optimize messages for storage before saving
        const memoryUsage = estimateConversationMemoryUsage(messages);
        console.log('Storage Optimization:', {
          originalMessages: messages.length,
          estimatedBytes: memoryUsage.estimatedBytes,
          isOverThreshold: memoryUsage.isOverThreshold,
          averageMessageSize: memoryUsage.averageMessageSize
        });

        const storageOptimizedMessages = optimizeMessagesForStorage(messages);
        
        // Complete session data with optimized storage
        const completedSession: ChatSession = {
          ...chatSession,
          messages: storageOptimizedMessages,
          endTime: new Date(),
          isCompleted: true
        };

        // Save to global store with optimized storage
        setChatSession(completedSession);
        markCounselingCompleted(true);

        // Phase 2: Use IntelligentSummarizer API for enhanced summarization
        console.log('Generating intelligent summary...');

        const summaryResponse = await fetch('/api/ai/intelligent-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session: completedSession,
            options: {
              useAI: true,
              qualityCheck: true,
              priority: 'quality'
            }
          })
        });

        if (summaryResponse.ok) {
          const { summary, metadata } = await summaryResponse.json();
          console.log('Intelligent summary generated:', { metadata });
          setChatSummary(summary);
        } else {
          // Fallback to legacy summarization
          console.warn('Intelligent summarization failed, using fallback');
          const { generateSessionSummary } = await import('@/lib/counseling/summarizer');
          const fallbackSummary = generateSessionSummary(completedSession);
          setChatSummary(fallbackSummary);
        }

      } catch (error) {
        console.error('Failed to generate summary:', error);
        // Continue without summary - fallback will be used in results page
        try {
          const { generateSessionSummary } = await import('@/lib/counseling/summarizer');
          const fallbackSummary = generateSessionSummary(chatSession);
          setChatSummary(fallbackSummary);
        } catch (fallbackError) {
          console.error('Fallback summarization also failed:', fallbackError);
          // Continue without summary
        }
      } finally {
        setIsSummarizing(false);
      }
    }

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
            <p className="text-sm text-muted-foreground">
              {isSummarizing ? 'セッション要約を生成中...' : '診断結果を基にした個別相談'}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleEndConsultation}
            size="sm"
            disabled={isSummarizing}
          >
            {isSummarizing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>要約生成中...</span>
              </div>
            ) : (
              '相談終了'
            )}
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
          <div className="flex-1 overflow-y-auto p-4 pb-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-lg ${
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

              {/* Completion Detection Message */}
              {completionDetection?.shouldShowContinueButton && (
                <CompletionMessage
                  nextAction={completionDetection.nextAction}
                  onContinue={handleContinueChat}
                />
              )}

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
                disabled={isStreaming || isSummarizing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isStreaming || isSummarizing}
                className="px-6"
              >
                送信
              </Button>
            </div>

            {/* Sticky End Consultation Button */}
            <div className="max-w-3xl mx-auto mt-4 pt-4 border-t border-border">
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={handleEndConsultation}
                  size="sm"
                  disabled={isSummarizing}
                  className="w-full sm:w-auto px-8"
                  aria-label="相談を終了して結果ページに移動"
                >
                  {isSummarizing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>要約生成中...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      相談終了
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Chat Guidance Overlay */}
      <GuidanceOverlay
        open={showChatOverlay}
        onClose={handleChatOverlayClose}
        title={chatOverlayContent.title}
        body={chatOverlayContent.body}
        primaryAction={chatOverlayContent.primaryAction}
        tone="instruction"
        illustration={
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.4-.32l-3.2.32 1.6-2.4a8 8 0 118-8z" />
            </svg>
          </div>
        }
      />
    </div>
  );
}