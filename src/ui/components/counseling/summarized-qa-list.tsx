'use client';

import type { ChatSummary } from '@/types';
import { getTopicIcon } from '@/lib/counseling/summarizer';

interface Props {
  summary: ChatSummary;
}

export const SummarizedQAList = ({ summary }: Props) => {
  // Use full transcript if available (new mode), otherwise use summarized Q&A
  const displayFullTranscript = summary.fullTranscript && summary.fullTranscript.length > 0;
  
  return (
    <div className="bg-white rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">💬 AIカウンセリング記録</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>相談カテゴリ:</span>
            <span>{getTopicIcon(summary.topicId)} {summary.topicTitle}</span>
          </span>
          <span>セッション時間: {summary.sessionDuration}分</span>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {displayFullTranscript ? (
          // Display full conversation transcript
          <div className="space-y-4">
            <div className="text-sm font-medium text-foreground mb-4">
              完全な会話記録 ({summary.fullTranscript!.length}件のメッセージ)
            </div>
            {summary.fullTranscript!.map((message, index) => (
              <div key={index} className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  {message.role === 'assistant' ? '🤖 AIカウンセラー' : '👤 ユーザー'}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground pl-4 whitespace-pre-wrap">
                  {message.content}
                </div>
                {index < summary.fullTranscript!.length - 1 && (
                  <div className="border-b border-border my-4"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Display summarized Q&A (legacy mode)
          summary.qaExchanges.length > 0 ? (
            summary.qaExchanges.map((exchange, index) => (
              <div key={index} className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    Q{index + 1}: [OpenAI質問要約]
                  </div>
                  <div className="text-sm text-muted-foreground pl-4">
                    {exchange.question}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    A{index + 1}: [ユーザー回答要約]
                  </div>
                  <div className="text-sm text-muted-foreground pl-4">
                    {exchange.answer}
                  </div>
                </div>
                
                {index < summary.qaExchanges.length - 1 && (
                  <div className="border-b border-border my-4"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              <p>相談内容の要約を準備中...</p>
            </div>
          )
        )}
        
        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          {displayFullTranscript 
            ? `※ 完全な会話記録: 全${summary.fullTranscript!.length}件のメッセージを保持 (Claude統合用)`
            : `※ Claude向け要約: 全${summary.qaExchanges.length}回のやり取り`
          }
        </div>
      </div>
    </div>
  );
};