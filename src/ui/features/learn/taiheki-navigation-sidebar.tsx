'use client';

import { useLearningStore, CHAPTER_INFO } from '@/lib/zustand/learning-store';
import { Button } from '@/ui/components/ui/button';
import { Progress } from '@/ui/components/ui/progress';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, Clock, BookOpen, ArrowRight, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaihekiNavigationSidebar() {
  const pathname = usePathname();
  const { progress, getProgress, isChapterCompleted, setCurrentChapter } = useLearningStore();
  
  const overallProgress = getProgress();
  const chapters = Object.entries(CHAPTER_INFO).sort((a, b) => a[1].order - b[1].order);
  
  const handleChapterClick = (chapterId: string) => {
    setCurrentChapter(chapterId);
  };

  return (
    <ComponentTag name="TaihekiNavigationSidebar" type="ui">
      <div className="bg-white border-r border-border h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground">
                体癖理論学習
              </h2>
              <p className="text-sm text-muted-foreground">
                野口整体の基本理論
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">学習進捗</span>
              <span className="text-lg font-bold text-brand-500">{overallProgress}%</span>
            </div>
            
            <Progress value={overallProgress} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.completedChapters.length} / {chapters.length} 章完了</span>
              <span>約{45 - progress.completedChapters.length * 9}分</span>
            </div>
            
            {overallProgress === 100 && (
              <div className="flex items-center justify-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">学習完了！</span>
              </div>
            )}
          </div>

          {/* Chapter Navigation */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground mb-3">学習章</h3>
            
            {chapters.map(([chapterId, chapterInfo]) => {
              const isCompleted = isChapterCompleted(chapterId);
              const isCurrent = progress.currentChapter === chapterId;
              const isCurrentPage = pathname === `/learn/taiheki/${chapterId}`;
              const quizScore = progress.quizScores[chapterId];
              
              return (
                <Link 
                  key={chapterId}
                  href={`/learn/taiheki/${chapterId}`}
                  onClick={() => handleChapterClick(chapterId)}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer",
                      isCurrentPage
                        ? "border-brand-500 bg-brand-50"
                        : isCompleted
                        ? "border-green-200 bg-green-50"
                        : isCurrent
                        ? "border-brand-200 bg-brand-25"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : isCurrentPage
                          ? "bg-brand-500 text-white"
                          : isCurrent
                          ? "bg-brand-100 text-brand-600"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          chapterInfo.order
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            isCurrentPage
                              ? "text-brand-700"
                              : "text-foreground"
                          )}>
                            第{chapterInfo.order}章
                          </h4>
                          {isCurrentPage && (
                            <ArrowRight className="w-3 h-3 text-brand-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {chapterInfo.title}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{chapterInfo.estimatedTime}分</span>
                          </div>
                          
                          {isCompleted && quizScore && (
                            <div className="flex items-center space-x-1">
                              <Star className={cn(
                                "w-3 h-3",
                                quizScore >= 80 ? "text-yellow-500" : "text-gray-400"
                              )} />
                              <span className="text-xs text-muted-foreground">
                                {quizScore}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-border">
            {overallProgress === 100 ? (
              <Link href="/diagnosis/taiheki">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  体癖診断を受ける
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/learn/taiheki">
                <Button variant="secondary" className="w-full">
                  学習概要に戻る
                </Button>
              </Link>
            )}
          </div>

          {/* Learning Tips */}
          {progress.completedChapters.length > 0 && progress.completedChapters.length < chapters.length && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    学習のコツ
                  </h4>
                  <p className="text-xs text-blue-700">
                    各章の最後にあるクイズで理解度を確認しましょう。80%以上のスコアを目指してください。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ComponentTag>
  );
}