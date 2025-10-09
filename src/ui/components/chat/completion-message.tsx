/**
 * AIチャット終了判断機能 - CompletionMessage コンポーネント
 * Phase 3: 終了メッセージUI実装
 *
 * @see claudedocs/ai-chat-completion-implementation-plan.md
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export interface CompletionMessageProps {
  nextAction: string;
  onContinue: () => void;
}

/**
 * チャット終了メッセージコンポーネント
 * フレンドリーなトーンで終了を示し、継続ボタンを提供
 */
export const CompletionMessage: React.FC<CompletionMessageProps> = ({
  nextAction,
  onContinue
}) => {
  return (
    <Card
      className="mt-4 border-brand-500 bg-brand-50"
      data-testid="completion-message"
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <div className="text-base text-foreground mb-4">
              {nextAction}
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={onContinue}
                className="border-brand-500 text-brand-700 hover:bg-brand-100"
                data-testid="continue-button"
                aria-label="会話を続ける"
              >
                会話を続ける
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
