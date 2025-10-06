'use client';

import React, { useState, useEffect } from 'react';
import { useLearningStore, CHAPTER_INFO } from '@/lib/zustand/learning-store';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { Progress } from '@/ui/components/ui/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  Brain,
  Users,
  Target,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonalizedHighlightCard } from '@/ui/components/learn/personalized-highlight-card';
import { getPersonalizedContent } from '@/lib/data/taiheki-personalized-content';
import { TypeComparisonModal } from '@/ui/components/learn/type-comparison-modal';

interface TaihekiChapterContentProps {
  chapter: string;
}

interface ChapterSection {
  id: string;
  title: string;
  content: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

export function TaihekiChapterContent({ chapter }: TaihekiChapterContentProps) {
  const router = useRouter();
  const { 
    progress, 
    markChapterComplete, 
    setCurrentChapter, 
    setQuizScore,
    isChapterCompleted,
    getProgress
  } = useLearningStore();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);  // 🆕 比較モーダル
  
  const chapterInfo = CHAPTER_INFO[chapter as keyof typeof CHAPTER_INFO];
  const isCompleted = isChapterCompleted(chapter);
  const chapters = Object.entries(CHAPTER_INFO).sort((a, b) => a[1].order - b[1].order);
  const currentChapterIndex = chapters.findIndex(([id]) => id === chapter);
  const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  
  useEffect(() => {
    setCurrentChapter(chapter);
  }, [chapter, setCurrentChapter]);

  if (!chapterInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">章が見つかりません</p>
      </div>
    );
  }

  const getChapterContent = (chapterId: string): ChapterSection[] => {
    const contentMap: Record<string, ChapterSection[]> = {
      'introduction': [
        {
          id: 'definition',
          title: '体癖とは',
          icon: Brain,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                体癖（たいへき）とは、野口整体における体の使い方や動きの特性を10種類に分類した理論体系です。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">重要なポイント</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 体癖は生まれ持った体の傾向性</li>
                  <li>• 良い悪いではなく、特性の違い</li>
                  <li>• 主体癖と副体癖の組み合わせで個性が現れる</li>
                  <li>• 自己理解と他者理解に活用できる</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          id: 'history',
          title: '野口整体での位置づけ',
          icon: BookOpen,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                野口晴哉（のぐち はるちか）によって体系化された整体法の中核理論として位置づけられています。
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">整体の基本理念</h5>
                  <p className="text-sm text-muted-foreground">
                    体の自然な働きを重視し、個々の体質に合った調整を行う
                  </p>
                </Card>
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">体癖理論の役割</h5>
                  <p className="text-sm text-muted-foreground">
                    個人の体質を理解し、最適な整体法を選択するための指針
                  </p>
                </Card>
              </div>
            </div>
          )
        }
      ],
      'types': [
        {
          id: 'overview',
          title: '10種体癖の分類',
          icon: Users,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                体癖は5つの軸（上下、左右、前後、捻れ、開閉）に基づいて10種類に分類されます。
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 border-red-200 bg-red-50">
                  <h5 className="font-semibold text-red-800 mb-2">上下型（1-2種）</h5>
                  <p className="text-sm text-red-700">頭部重心、理論的思考</p>
                </Card>
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <h5 className="font-semibold text-blue-800 mb-2">左右型（3-4種）</h5>
                  <p className="text-sm text-blue-700">感情豊か、情緒的判断</p>
                </Card>
                <Card className="p-4 border-green-200 bg-green-50">
                  <h5 className="font-semibold text-green-800 mb-2">前後型（5-6種）</h5>
                  <p className="text-sm text-green-700">行動重視、実践的</p>
                </Card>
                <Card className="p-4 border-purple-200 bg-purple-50">
                  <h5 className="font-semibold text-purple-800 mb-2">捻れ型（7-8種）</h5>
                  <p className="text-sm text-purple-700">変化志向、創造的</p>
                </Card>
                <Card className="p-4 border-orange-200 bg-orange-50">
                  <h5 className="font-semibold text-orange-800 mb-2">開閉型（9-10種）</h5>
                  <p className="text-sm text-orange-700">集団意識、協調性</p>
                </Card>
              </div>
            </div>
          )
        },
        {
          id: 'characteristics',
          title: '各タイプの詳細特徴',
          icon: Target,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                それぞれの体癖には独特の身体的・精神的特徴があります。
              </p>
              <div className="space-y-3">
                {[1,2,3,4,5,6,7,8,9,10].map(type => (
                  <Card key={type} className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-600">
                        {type}
                      </div>
                      <div className="flex-1">
                        <h6 className="font-semibold mb-1">{type}種体癖</h6>
                        <p className="text-sm text-muted-foreground">
                          {getTypeDescription(type)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        }
      ],
      'primary-secondary': [
        {
          id: 'concept',
          title: '主体癖・副体癖とは',
          icon: Brain,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                一人の人には主体癖（最も強い特徴）と副体癖（二番目に強い特徴）があり、その組み合わせが個性を作り出します。
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 border-brand-200 bg-brand-50">
                  <h5 className="font-semibold text-brand-800 mb-2">主体癖</h5>
                  <ul className="text-sm text-brand-700 space-y-1">
                    <li>• 最も強く現れる特徴</li>
                    <li>• 基本的な行動パターン</li>
                    <li>• 無意識の判断基準</li>
                    <li>• ストレス時に顕著に現れる</li>
                  </ul>
                </Card>
                <Card className="p-4 border-green-200 bg-green-50">
                  <h5 className="font-semibold text-green-800 mb-2">副体癖</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 二番目に強い特徴</li>
                    <li>• 主体癖を補完する役割</li>
                    <li>• バランスを取る働き</li>
                    <li>• 成長とともに変化することも</li>
                  </ul>
                </Card>
              </div>
            </div>
          )
        },
        {
          id: 'combinations',
          title: '組み合わせの解釈',
          icon: Target,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                主体癖と副体癖の組み合わせによって、より詳細な個性の分析が可能になります。
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-800 mb-2">組み合わせの例</h5>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p><strong>主1種・副3種：</strong> 理論的思考と感情のバランス</p>
                  <p><strong>主5種・副9種：</strong> 行動力と協調性の組み合わせ</p>
                  <p><strong>主7種・副2種：</strong> 創造性と分析力の融合</p>
                </div>
              </div>
            </div>
          )
        }
      ],
      'applications': [
        {
          id: 'daily-life',
          title: '日常生活での活用',
          icon: Lightbulb,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                体癖理論は日常のさまざまな場面で自己理解と他者理解に活用できます。
              </p>
              <div className="space-y-3">
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">コミュニケーション改善</h5>
                  <p className="text-sm text-muted-foreground">
                    相手の体癖を理解することで、効果的な伝え方や接し方がわかります。
                  </p>
                </Card>
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">ストレス管理</h5>
                  <p className="text-sm text-muted-foreground">
                    自分の体癖に合ったストレス解消法や休息方法を見つけられます。
                  </p>
                </Card>
                <Card className="p-4">
                  <h5 className="font-semibold mb-2">職業選択</h5>
                  <p className="text-sm text-muted-foreground">
                    体癖の特性を活かせる職業や働き方のヒントが得られます。
                  </p>
                </Card>
              </div>
            </div>
          )
        }
      ],
      'significance': [
        {
          id: 'self-understanding',
          title: '自己理解の深化',
          icon: Brain,
          content: (
            <div className="space-y-4">
              <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
                体癖診断を通じて、自分自身への理解を深め、より充実した人生を送るためのヒントを得ることができます。
              </p>
              <div className="bg-gradient-brand text-white rounded-lg p-6">
                <h5 className="font-semibold mb-3">体癖診断がもたらすもの</h5>
                <ul className="space-y-2 text-sm">
                  <li>✓ 自分の特性への気づき</li>
                  <li>✓ 他者との違いへの理解</li>
                  <li>✓ ストレスの原因の把握</li>
                  <li>✓ 最適な生活リズムの発見</li>
                  <li>✓ 人間関係の改善</li>
                </ul>
              </div>
            </div>
          )
        }
      ]
    };
    
    return contentMap[chapterId] || [];
  };

  const getTypeDescription = (type: number): string => {
    const descriptions: Record<number, string> = {
      1: "頭脳明晰、理論重視、完璧主義傾向",
      2: "分析力に長け、慎重な判断、集中力が高い",
      3: "感情豊か、共感力が高い、人間関係を重視",
      4: "直感的判断、芸術的センス、情緒的",
      5: "行動力抜群、実践的、リーダーシップ",
      6: "粘り強い、継続力、現実的思考",
      7: "変化を好む、創造的、柔軟性",
      8: "独創性、革新的思考、自由奔放",
      9: "協調性、チームワーク、安定志向",
      10: "集団統率力、責任感、包容力"
    };
    return descriptions[type] || "";
  };

  const getQuizQuestions = (chapterId: string) => {
    const quizMap: Record<string, Array<{question: string, options: string[], correct: number}>> = {
      'introduction': [
        {
          question: "体癖理論を体系化したのは誰ですか？",
          options: ["野口晴哉", "野口英世", "野口五郎", "野口聡一"],
          correct: 0
        },
        {
          question: "体癖は何種類に分類されますか？",
          options: ["8種類", "10種類", "12種類", "16種類"],
          correct: 1
        },
        {
          question: "体癖理論の基本的な考え方として正しいものはどれですか？",
          options: ["優劣を決めるもの", "個性の特徴を理解するもの", "病気を診断するもの", "運命を占うもの"],
          correct: 1
        }
      ],
      'types': [
        {
          question: "上下型（1-2種）の特徴として正しいものはどれですか？",
          options: ["感情的判断", "理論的思考", "行動重視", "協調性重視"],
          correct: 1
        },
        {
          question: "左右型（3-4種）の特徴として正しいものはどれですか？",
          options: ["頭部重心", "感情豊か", "実践的", "変化志向"],
          correct: 1
        }
      ],
      'primary-secondary': [
        {
          question: "主体癖について正しいものはどれですか？",
          options: ["二番目に強い特徴", "最も強く現れる特徴", "補完する役割", "変化しやすい特徴"],
          correct: 1
        },
        {
          question: "副体癖の役割として正しいものはどれですか？",
          options: ["主体癖を無効にする", "主体癖を強化する", "主体癖を補完する", "主体癖と対立する"],
          correct: 2
        }
      ],
      'applications': [
        {
          question: "体癖理論の日常活用として適切なものはどれですか？",
          options: ["病気の治療", "運勢の占い", "コミュニケーション改善", "成績の向上"],
          correct: 2
        }
      ],
      'significance': [
        {
          question: "体癖診断の意義として最も重要なものはどれですか？",
          options: ["他者との優劣比較", "自己理解の深化", "将来の予測", "能力の測定"],
          correct: 1
        }
      ]
    };
    return quizMap[chapterId] || [];
  };

  const sections = getChapterContent(chapter);
  const quizQuestions = getQuizQuestions(chapter);
  
  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleQuizComplete = () => {
    const correctAnswers = quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length;
    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    
    setQuizScore(chapter, score);
    setQuizCompleted(true);
    
    if (!isCompleted) {
      markChapterComplete(chapter);
    }
  };

  const sectionProgress = ((currentSection + 1) / sections.length) * 100;

  return (
    
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>第{chapterInfo.order}章</span>
            <span>•</span>
            <Clock className="w-4 h-4" />
            <span>約{chapterInfo.estimatedTime}分</span>
            {isCompleted && (
              <>
                <span>•</span>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">完了済み</span>
              </>
            )}
          </div>
          
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-h1-mobile md:text-h1-desktop font-heading text-foreground flex-1">
                {chapterInfo.title}
              </h1>

              {/* 🆕 第2章のみ比較ボタンを表示 */}
              {chapter === 'types' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowComparisonModal(true)}
                  className="flex-shrink-0"
                >
                  🔄 タイプを比較
                </Button>
              )}
            </div>
            <p className="text-body-l-mobile md:text-body-l-desktop text-muted-foreground">
              {chapterInfo.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">学習進捗</span>
              <span className="text-sm text-muted-foreground">
                {currentSection + 1} / {sections.length} セクション
              </span>
            </div>
            <Progress value={sectionProgress} className="h-2" />
          </div>
        </div>

        {!showQuiz ? (
          <>
            {/* Content */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                    {React.createElement(sections[currentSection].icon, { 
                      className: "w-5 h-5 text-brand-600" 
                    })}
                  </div>
                  <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-foreground">
                    {sections[currentSection].title}
                  </h2>
                </div>
                
                <div className="prose max-w-none">
                  {sections[currentSection].content}
                </div>

                {/* 🆕 パーソナライズドコンテンツ */}
                {progress.userContext && (() => {
                  const personalizedContent = getPersonalizedContent(
                    chapter,
                    progress.userContext.primaryType
                  );

                  if (!personalizedContent) return null;

                  return (
                    <PersonalizedHighlightCard
                      primaryType={progress.userContext.primaryType}
                      secondaryType={progress.userContext.secondaryType}
                    >
                      <p className="font-medium mb-2">{personalizedContent.summary}</p>
                      <ul className="space-y-1 ml-4 list-disc">
                        {personalizedContent.characteristics.map((char, index) => (
                          <li key={index}>{char}</li>
                        ))}
                      </ul>
                      {personalizedContent.practicalTips && (
                        <div className="mt-3 pt-3 border-t border-green-300">
                          <p className="text-xs text-green-700">
                            💡 <strong>実践のヒント:</strong> {personalizedContent.practicalTips}
                          </p>
                        </div>
                      )}
                    </PersonalizedHighlightCard>
                  );
                })()}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                前のセクション
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {currentSection + 1} / {sections.length}
              </div>
              
              {currentSection < sections.length - 1 ? (
                <Button
                  onClick={() => setCurrentSection(currentSection + 1)}
                >
                  次のセクション
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowQuiz(true)}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  理解度チェック
                  <Award className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Quiz */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-foreground">
                    理解度チェック
                  </h2>
                </div>
                
                {!quizCompleted ? (
                  <div className="space-y-6">
                    {quizQuestions.map((question, qIndex) => (
                      <div key={qIndex} className="space-y-3">
                        <h3 className="font-semibold">
                          問{qIndex + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className={cn(
                                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all",
                                quizAnswers[qIndex] === oIndex
                                  ? "border-brand-500 bg-brand-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              )}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={oIndex}
                                checked={quizAnswers[qIndex] === oIndex}
                                onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                className="text-brand-600 focus:ring-brand-500"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      onClick={handleQuizComplete}
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      className="w-full bg-brand-600 hover:bg-brand-700"
                    >
                      答えを提出
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">章の学習が完了しました！</h3>
                    <p className="text-muted-foreground">
                      スコア: {progress.quizScores[chapter]}% 
                      ({quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length} / {quizQuestions.length} 問正解)
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div>
            {prevChapter ? (
              <Link href={`/learn/taiheki/${prevChapter[0]}`}>
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  第{prevChapter[1].order}章
                </Button>
              </Link>
            ) : (
              <Link href="/learn/taiheki">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  学習概要
                </Button>
              </Link>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              全体進捗: {getProgress()}%
            </p>
          </div>
          
          <div>
            {nextChapter ? (
              <Link href={`/learn/taiheki/${nextChapter[0]}`}>
                <Button>
                  第{nextChapter[1].order}章
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : quizCompleted ? (
              <Link href="/diagnosis/taiheki">
                <Button className="bg-brand-600 hover:bg-brand-700">
                  体癖診断を受ける
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button disabled>
                学習完了
              </Button>
            )}
          </div>
        </div>

        {/* 🆕 タイプ比較モーダル */}
        <TypeComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          initialTypes={progress.userContext ? [progress.userContext.primaryType] : []}
        />
      </div>

  );
}