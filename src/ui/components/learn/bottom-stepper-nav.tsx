'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLearningStore, CHAPTER_INFO } from '@/lib/zustand/learning-store';
import { Button } from '@/ui/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BottomStepperNav - モバイル向けボトムナビゲーション
 *
 * スマートフォンの親指操作圏内（画面下部）に配置するナビゲーション。
 * 章間の移動と進捗表示を提供する。
 *
 * Features:
 * - 前章/次章への移動ボタン
 * - 現在章の進捗ドット表示
 * - セーフエリア対応（iPhone ホームインジケーター対策）
 */
export function BottomStepperNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setCurrentChapter } = useLearningStore();

  // 章リストを順番に取得
  const chapters = Object.entries(CHAPTER_INFO).sort((a, b) => a[1].order - b[1].order);

  // 現在の章を特定
  const currentChapterIndex = chapters.findIndex(([chapterId]) =>
    pathname.includes(`/learn/taiheki/${chapterId}`)
  );

  // 概要ページの場合は非表示
  if (currentChapterIndex === -1) return null;

  const currentChapter = chapters[currentChapterIndex];
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const handleNavigation = (chapterId: string) => {
    setCurrentChapter(chapterId);
    router.push(`/learn/taiheki/${chapterId}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* メインナビゲーション */}
      <div className="flex items-center justify-between px-4 py-3 safe-area-pb">
        {/* 前章ボタン */}
        <Button
          variant="tertiary"
          size="sm"
          disabled={!prevChapter}
          onClick={() => prevChapter && handleNavigation(prevChapter[0])}
          className={cn(
            "min-w-[80px] h-10 text-sm font-medium",
            !prevChapter && "opacity-30 cursor-not-allowed"
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          前章
        </Button>

        {/* 進捗表示（中央） */}
        <div className="flex flex-col items-center space-y-1">
          {/* 章番号 */}
          <span className="text-xs text-muted-foreground font-medium">
            第{currentChapter[1].order}章 / 全{chapters.length}章
          </span>

          {/* 進捗ドット */}
          <div className="flex space-x-1.5">
            {chapters.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentChapterIndex
                    ? "bg-brand-500 w-6"  // 現在章は横長
                    : index < currentChapterIndex
                    ? "bg-brand-300"      // 完了章は薄い色
                    : "bg-gray-300"       // 未完了章はグレー
                )}
              />
            ))}
          </div>
        </div>

        {/* 次章ボタン */}
        <Button
          variant="tertiary"
          size="sm"
          disabled={!nextChapter}
          onClick={() => nextChapter && handleNavigation(nextChapter[0])}
          className={cn(
            "min-w-[80px] h-10 text-sm font-medium",
            !nextChapter && "opacity-30 cursor-not-allowed"
          )}
        >
          次章
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* セーフエリア対応（iPhoneホームインジケーター領域） */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
}
