'use client';

import { useLearningStore, CHAPTER_INFO } from '@/lib/zustand/learning-store';
import { Button } from '@/ui/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Clock, BookOpen, ArrowRight } from 'lucide-react';

export function TaihekiLearningOverview() {
  const { progress, getProgress, isChapterCompleted, setCurrentChapter } = useLearningStore();
  
  const overallProgress = getProgress();
  const chapters = Object.entries(CHAPTER_INFO).sort((a, b) => a[1].order - b[1].order);
  
  const handleChapterStart = (chapterId: string) => {
    setCurrentChapter(chapterId);
  };

  return (
    
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-h1-mobile md:text-h1-desktop font-heading text-foreground mb-4">
              体癖理論学習サイト
            </h1>
            <p className="text-body-l-mobile md:text-body-l-desktop text-muted-foreground max-w-3xl mx-auto">
              野口整体の体癖理論を段階的に学び、体癖診断の理解を深めましょう。<br />
              全5章の学習コンテンツとインタラクティブな要素で、体系的な知識を身につけることができます。
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-card p-6 shadow-z2 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3-mobile font-heading text-foreground">学習進捗</h3>
            <div className="text-2xl font-bold text-brand-500">{overallProgress}%</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-brand h-3 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{progress.completedChapters.length} / {chapters.length} 章完了</span>
            <span>推定残り時間: {45 - progress.completedChapters.length * 9}分</span>
          </div>
          
          {progress.lastVisited && (
            <div className="mt-3 text-xs text-muted-foreground">
              最終学習: {new Date(progress.lastVisited).toLocaleDateString('ja-JP')}
            </div>
          )}
        </div>

        {/* Chapter List */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-foreground mb-8 text-center">
            学習コンテンツ
          </h2>
          
          <div className="space-y-4">
            {chapters.map(([chapterId, chapterInfo]) => {
              const isCompleted = isChapterCompleted(chapterId);
              const isCurrent = progress.currentChapter === chapterId;
              const quizScore = progress.quizScores[chapterId];
              
              return (
                <div
                  key={chapterId}
                  className={`
                    bg-white rounded-card p-6 shadow-z1 hover:shadow-z2 transition-all
                    ${isCurrent ? 'border-2 border-brand-500' : 'border border-border'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isCurrent 
                            ? 'bg-brand-100 text-brand-600' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            chapterInfo.order
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            第{chapterInfo.order}章：{chapterInfo.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {chapterInfo.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>約{chapterInfo.estimatedTime}分</span>
                        </div>
                        
                        {isCompleted && quizScore && (
                          <div className="flex items-center space-x-1">
                            <div className={`
                              w-2 h-2 rounded-full 
                              ${quizScore >= 80 ? 'bg-green-500' : 'bg-yellow-500'}
                            `} />
                            <span>クイズスコア: {quizScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href={`/learn/taiheki/${chapterId}`}>
                        <Button
                          variant={isCompleted ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => handleChapterStart(chapterId)}
                          className="w-28"
                        >
                          {isCompleted ? '復習する' : isCurrent ? '続ける' : '開始する'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Step */}
        <div className="bg-brand-50 border border-brand-200 rounded-card p-6 max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-brand-900 mb-3">
            {overallProgress === 100 ? '学習完了！' : '学習を始めましょう'}
          </h3>
          <p className="text-brand-700 mb-4">
            {overallProgress === 100 
              ? 'すべての学習が完了しました。体癖診断を受けて実践してみましょう。'
              : '体癖理論の基本から応用まで、段階的に学習していきます。'
            }
          </p>
          
          {overallProgress === 100 ? (
            <Link href="/diagnosis/taiheki">
              <Button className="bg-brand-600 hover:bg-brand-700">
                体癖診断を受ける
              </Button>
            </Link>
          ) : (
            <Link href={`/learn/taiheki/${chapters[0][0]}`}>
              <Button 
                onClick={() => handleChapterStart(chapters[0][0])}
                className="bg-brand-600 hover:bg-brand-700"
              >
                学習を開始する
              </Button>
            </Link>
          )}
        </div>
      </div>
    
  );
}