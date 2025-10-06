'use client';

import { useState } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Progress } from '@/ui/components/ui/progress';
import { useLearningStore } from '@/lib/zustand/learning-store';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface InteractiveQuizProps {
  id: string;
  title?: string;
  questions: QuizQuestion[];
  passingScore?: number;
}

export function InteractiveQuiz({ 
  id, 
  title = "理解度チェック", 
  questions,
  passingScore = 70 
}: InteractiveQuizProps) {
  const { setQuizScore, progress: _progress } = useLearningStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isAnswered = selectedAnswer !== null;
  const _isCorrect = isAnswered && selectedAnswer === currentQ.correct;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex);
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: answerIndex
      }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // クイズ完了処理
      const correctAnswers = Object.entries(answers).filter(([questionIndex, answer]) => 
        answer === questions[parseInt(questionIndex)].correct
      ).length;
      
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      setQuizScore(id, finalScore);
      setIsCompleted(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsCompleted(false);
    setScore(0);
  };

  if (isCompleted) {
    const passed = score >= passingScore;
    
    return (
      <Card className="p-6 my-6">
        <div className="text-center space-y-4">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
            passed ? "bg-green-100" : "bg-orange-100"
          )}>
            {passed ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-orange-600" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold">
            {title}完了！
          </h3>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-brand-600">{score}点</p>
            <p className="text-muted-foreground">
              {questions.length}問中{Object.values(answers).filter((answer, index) => 
                answer === questions[index].correct
              ).length}問正解
            </p>
            <p className={cn(
              "font-medium",
              passed ? "text-green-600" : "text-orange-600"
            )}>
              {passed ? `合格！（${passingScore}点以上）` : `不合格（${passingScore}点未満）`}
            </p>
          </div>
          
          {!passed && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-700">
              <p>理解を深めるために、もう一度学習内容を確認してからチャレンジしてみましょう。</p>
            </div>
          )}
          
          <Button onClick={handleRestart} variant="secondary">
            もう一度挑戦する
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 my-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">
            問{currentQuestion + 1} / {questions.length}
          </span>
        </div>

        {/* Progress */}
        <Progress value={((currentQuestion) / questions.length) * 100} className="h-2" />

        {/* Question */}
        <div className="space-y-4">
          <h4 className="text-base font-medium">{currentQ.question}</h4>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500",
                  isAnswered && index === currentQ.correct && "border-green-500 bg-green-50",
                  isAnswered && index === selectedAnswer && index !== currentQ.correct && "border-red-500 bg-red-50",
                  selectedAnswer === index && !isAnswered && "border-brand-500 bg-brand-50",
                  !isAnswered ? "border-gray-200" : "border-gray-300"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium mt-0.5",
                    isAnswered && index === currentQ.correct ? "border-green-500 bg-green-500 text-white" :
                    isAnswered && index === selectedAnswer && index !== currentQ.correct ? "border-red-500 bg-red-500 text-white" :
                    selectedAnswer === index ? "border-brand-500 bg-brand-500 text-white" :
                    "border-gray-300"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {isAnswered && index === currentQ.correct && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {isAnswered && index === selectedAnswer && index !== currentQ.correct && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {isAnswered && showExplanation && currentQ.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">解説</h5>
                <p className="text-sm text-blue-700">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {isAnswered && currentQ.explanation && !showExplanation ? (
            <Button variant="secondary" onClick={handleShowExplanation}>
              <Lightbulb className="w-4 h-4 mr-2" />
              解説を見る
            </Button>
          ) : (
            <div />
          )}
          
          <Button 
            onClick={handleNext}
            disabled={!isAnswered}
            className={cn(
              !isAnswered && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLastQuestion ? "結果を見る" : "次の問題"}
          </Button>
        </div>
      </div>
    </Card>
  );
}