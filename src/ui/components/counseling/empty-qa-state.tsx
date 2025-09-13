'use client';

import Link from 'next/link';
import { Button } from '@/ui/components/ui/button';

export const EmptyQAState = () => (
  <div className="bg-white rounded-lg border border-border">
    <div className="p-4 border-b border-border">
      <h3 className="text-lg font-semibold text-foreground">💬 質問＆回答リスト</h3>
    </div>
    
    <div className="p-8 text-center space-y-6">
      <div className="space-y-4">
        <div className="text-4xl">🤖</div>
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">
            AIカウンセリングを利用すると、
          </p>
          <p className="text-base text-muted-foreground">
            個別化されたアドバイスが
          </p>
          <p className="text-base text-muted-foreground">
            ここに表示されます
          </p>
        </div>
      </div>
      
      <div className="pt-4">
        <Link href="/diagnosis/chat">
          <Button size="lg" className="px-8">
            AIカウンセリングを開始
          </Button>
        </Link>
      </div>
    </div>
  </div>
);