'use client';

import { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { Progress } from '@/ui/components/ui/progress';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;  // 正解のインデックス (0-based)
  explanation?: string;
}

interface InlineChapterQuizProps {
  quizId: string;
  title?: string;
  questions: QuizQuestion[];
  passingScore?: number;  // 合格点（パーセンテージ、デフォルト70）
  onComplete: (score: number, passed: boolean) => void;
  onRetry?: () => void;
}

/**
 * InlineChapterQuiz - 章内埋め込みクイズコンポーネント
 *
 * Features:
 * - 1問ずつ表示形式
 * - 即時フィードバック（正解/不正解表示）
 * - 解説表示
 * - スコア計算と合否判定
 * - リトライ機能
 */
export function InlineChapterQuiz({
  quizId: _quizId,
  title = '理解度チェック',
  questions,
  passingScore = 70,
  onComplete,
  onRetry,
}: InlineChapterQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = isAnswered && selectedAnswer === currentQuestion.correct;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex);
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // 回答を記録
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }));

    if (isLastQuestion) {
      // クイズ完了 - 最後の回答も含めて採点
      const allAnswers = {
        ...answers,
        [currentQuestion.id]: selectedAnswer,
      };

      const totalCorrect = Object.entries(allAnswers).filter(
        ([qId, answer]) => {
          const question = questions.find((q) => q.id === parseInt(qId));
          return question && answer === question.correct;
        }
      ).length;

      const score = Math.round((totalCorrect / questions.length) * 100);
      const passed = score >= passingScore;

      setIsCompleted(true);
      onComplete(score, passed);
    } else {
      // 次の問題へ
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers({});
    setIsCompleted(false);
    onRetry?.();
  };

  const calculateScore = () => {
    const totalCorrect = Object.entries(answers).filter(
      ([qId, answer]) => {
        const question = questions.find((q) => q.id === parseInt(qId));
        return question && answer === question.correct;
      }
    ).length;

    return Math.round((totalCorrect / questions.length) * 100);
  };

  const score = calculateScore();
  const passed = score >= passingScore;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isCompleted) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-6">
          {/* 結果アイコン */}
          <div
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
              passed ? "bg-green-100" : "bg-yellow-100"
            )}
          >
            {passed ? (
              <Trophy className="w-10 h-10 text-green-600" />
            ) : (
              <RotateCcw className="w-10 h-10 text-yellow-600" />
            )}
          </div>

          {/* スコア表示 */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {passed ? '合格です！' : 'もう一度挑戦しましょう'}
            </h3>
            <p className="text-5xl font-bold text-brand-600 mb-2">{score}点</p>
            <p className="text-sm text-muted-foreground">
              {questions.length}問中 {Math.round((score / 100) * questions.length)}問正解
              {!passed && ` • 合格ライン: ${passingScore}点`}
            </p>
          </div>

          {/* メッセージ */}
          <div
            className={cn(
              "p-4 rounded-lg",
              passed ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
            )}
          >
            <p className={cn("text-sm", passed ? "text-green-800" : "text-yellow-800")}>
              {passed
                ? '素晴らしい！理解が深まりました。次の章に進みましょう。'
                : `${passingScore}点以上で次の章に進めます。復習してもう一度挑戦してみましょう。`}
            </p>
          </div>

          {/* アクションボタン */}
          {!passed && onRetry && (
            <Button onClick={handleRetry} variant="primary" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度挑戦する
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <span className="text-sm text-muted-foreground">
            問{currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 質問 */}
      <div className="space-y-4">
        <p className="text-lg font-medium text-foreground">{currentQuestion.question}</p>

        {/* 選択肢 */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correct;
            const showCorrect = isAnswered && isCorrectAnswer;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  "hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500",
                  isAnswered && "cursor-not-allowed",
                  !isAnswered && "hover:bg-gray-50",
                  showCorrect && "bg-green-50 border-green-500",
                  showIncorrect && "bg-red-50 border-red-500",
                  !showCorrect && !showIncorrect && isSelected && "border-brand-500 bg-brand-50",
                  !showCorrect && !showIncorrect && !isSelected && "border-gray-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{option}</span>
                  {showCorrect && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* 解説 */}
        {showExplanation && currentQuestion.explanation && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              isCorrect ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
            )}
          >
            <p className="text-sm font-semibold mb-1 text-foreground">
              {isCorrect ? '✅ 正解！' : '💡 解説'}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* 次へボタン */}
      <Button
        onClick={handleNext}
        disabled={!isAnswered}
        variant="primary"
        className="w-full"
      >
        {isLastQuestion ? '結果を見る' : '次の問題へ'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}
