import React, { useState, useEffect } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { cn } from '@/lib/utils';
import { Save, RotateCcw, BookOpen, Target, Heart, Lightbulb } from 'lucide-react';

interface ReflectionPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'self-discovery' | 'application' | 'growth' | 'understanding';
  placeholder: string;
  minWords?: number;
  suggestions?: string[];
}

const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  {
    id: 'self-understanding',
    title: '自己理解',
    category: 'self-discovery',
    prompt: '今回学んだ体癖理論を通じて、自分自身についてどのような発見がありましたか？',
    placeholder: '例：自分が理論的思考を重視する1種の傾向があることに気づき、感情面をもっと大切にしたいと思いました...',
    minWords: 50,
    suggestions: [
      '新しい自己発見',
      '意外だった特徴',
      '納得できた行動パターン',
      '改善したい点'
    ]
  },
  {
    id: 'daily-application',
    title: '日常への応用',
    category: 'application',
    prompt: '体癖理論を日常生活やコミュニケーションにどのように活用していきますか？',
    placeholder: '例：家族との会話で、相手の体癖を意識して話し方を変えてみたいと思います...',
    minWords: 40,
    suggestions: [
      'コミュニケーション改善',
      'ストレス管理',
      '職場での活用',
      '人間関係の改善'
    ]
  },
  {
    id: 'growth-plan',
    title: '成長プラン',
    category: 'growth',
    prompt: '自分の体癖の特徴を踏まえて、今後どのような成長を目指しますか？',
    placeholder: '例：自分の強みである継続力を活かしつつ、苦手な変化への適応力を身につけたい...',
    minWords: 60,
    suggestions: [
      '強みの活用方法',
      '弱みの改善策',
      '新しい挑戦',
      '習慣の見直し'
    ]
  },
  {
    id: 'others-understanding',
    title: '他者理解',
    category: 'understanding',
    prompt: '体癖理論を学んで、他の人への理解や接し方に変化はありますか？',
    placeholder: '例：同僚の行動が理解できないことがありましたが、体癖の違いだと分かり受け入れやすくなりました...',
    minWords: 45,
    suggestions: [
      '他者への理解の変化',
      '寛容性の向上',
      '多様性の受容',
      '関係改善のアイデア'
    ]
  }
];

const CATEGORY_INFO = {
  'self-discovery': {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    label: '自己発見'
  },
  'application': {
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: '実践応用'
  },
  'growth': {
    icon: Lightbulb,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: '成長発展'
  },
  'understanding': {
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: '理解深化'
  }
};

interface ReflectionPromptProps {
  id?: string;
  selectedPrompts?: string[];
  autoSave?: boolean;
  showWordCount?: boolean;
  onReflectionSave?: (promptId: string, content: string) => void;
}

export function ReflectionPrompt({ 
  id = 'reflection-prompt',
  selectedPrompts,
  autoSave = true,
  showWordCount = true,
  onReflectionSave
}: ReflectionPromptProps) {
  const [activePrompt, setActivePrompt] = useState(selectedPrompts?.[0] || REFLECTION_PROMPTS[0].id);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [savedReflections, setSavedReflections] = useState<Record<string, boolean>>({});
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});

  // localStorage からの読み込み
  useEffect(() => {
    const saved = localStorage.getItem(`${id}-reflections`);
    if (saved) {
      try {
        const parsedReflections = JSON.parse(saved);
        setReflections(parsedReflections);
        
        // 単語数の計算
        const counts: Record<string, number> = {};
        Object.entries(parsedReflections).forEach(([promptId, content]) => {
          counts[promptId] = (content as string).trim().split(/\s+/).filter(word => word.length > 0).length;
        });
        setWordCounts(counts);
      } catch (error) {
        console.error('Failed to load reflections:', error);
      }
    }
  }, [id]);

  // 自動保存
  useEffect(() => {
    if (autoSave && Object.keys(reflections).length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem(`${id}-reflections`, JSON.stringify(reflections));
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [reflections, autoSave, id]);

  const filteredPrompts = selectedPrompts 
    ? REFLECTION_PROMPTS.filter(p => selectedPrompts.includes(p.id))
    : REFLECTION_PROMPTS;

  const currentPrompt = REFLECTION_PROMPTS.find(p => p.id === activePrompt)!;
  const categoryInfo = CATEGORY_INFO[currentPrompt.category];
  const IconComponent = categoryInfo.icon;

  const handleTextChange = (promptId: string, content: string) => {
    setReflections(prev => ({
      ...prev,
      [promptId]: content
    }));
    
    // 単語数の更新
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCounts(prev => ({
      ...prev,
      [promptId]: wordCount
    }));
    
    // 保存状態をリセット
    setSavedReflections(prev => ({
      ...prev,
      [promptId]: false
    }));
  };

  const handleSave = (promptId: string) => {
    const content = reflections[promptId] || '';
    
    // コールバック実行
    onReflectionSave?.(promptId, content);
    
    // 保存状態を更新
    setSavedReflections(prev => ({
      ...prev,
      [promptId]: true
    }));
    
    // localStorageに保存
    localStorage.setItem(`${id}-reflections`, JSON.stringify(reflections));
    
    // 一定時間後に保存状態をリセット
    setTimeout(() => {
      setSavedReflections(prev => ({
        ...prev,
        [promptId]: false
      }));
    }, 2000);
  };

  const handleClear = (promptId: string) => {
    if (confirm('入力内容を削除してもよろしいですか？')) {
      setReflections(prev => {
        const newReflections = { ...prev };
        delete newReflections[promptId];
        return newReflections;
      });
      
      setWordCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[promptId];
        return newCounts;
      });
    }
  };

  const currentContent = reflections[activePrompt] || '';
  const currentWordCount = wordCounts[activePrompt] || 0;
  const isSaved = savedReflections[activePrompt];
  const meetsMinWords = !currentPrompt.minWords || currentWordCount >= currentPrompt.minWords;

  return (
    <div className="space-y-6 my-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">振り返りと考察</h3>
            <p className="text-sm text-muted-foreground">
              学習内容を振り返り、自分なりの考察を記録しましょう
            </p>
          </div>

          {/* Prompt Selection */}
          <div className="flex flex-wrap gap-2 justify-center">
            {filteredPrompts.map(prompt => {
              const info = CATEGORY_INFO[prompt.category];
              const hasContent = reflections[prompt.id]?.length > 0;
              
              return (
                <Button
                  key={prompt.id}
                  size="sm"
                  variant={activePrompt === prompt.id ? "primary" : "secondary"}
                  onClick={() => setActivePrompt(prompt.id)}
                  className={cn(
                    "relative",
                    hasContent && "ring-2 ring-green-200"
                  )}
                >
                  <info.icon className="w-4 h-4 mr-1" />
                  {prompt.title}
                  {hasContent && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Current Prompt */}
          <Card className={cn("p-4", categoryInfo.bgColor, categoryInfo.borderColor)}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", categoryInfo.bgColor)}>
                  <IconComponent className={cn("w-4 h-4", categoryInfo.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{currentPrompt.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {categoryInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentPrompt.prompt}</p>
                </div>
              </div>

              {/* Suggestions */}
              {currentPrompt.suggestions && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">考えるヒント：</p>
                  <div className="flex flex-wrap gap-1">
                    {currentPrompt.suggestions.map(suggestion => (
                      <Badge key={suggestion} variant="secondary" className="text-xs">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Text Area */}
          <div className="space-y-3">
            <textarea
              value={currentContent}
              onChange={(e) => handleTextChange(activePrompt, e.target.value)}
              placeholder={currentPrompt.placeholder}
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
            />
            
            {/* Word Count & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {showWordCount && (
                  <span>
                    {currentWordCount}語
                    {currentPrompt.minWords && (
                      <span className={cn(
                        "ml-1",
                        meetsMinWords ? "text-green-600" : "text-red-600"
                      )}>
                        (目安: {currentPrompt.minWords}語以上)
                      </span>
                    )}
                  </span>
                )}
                
                {isSaved && (
                  <span className="text-green-600 flex items-center">
                    <Save className="w-3 h-3 mr-1" />
                    保存済み
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleClear(activePrompt)}
                  disabled={!currentContent}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  クリア
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleSave(activePrompt)}
                  disabled={!currentContent.trim()}
                  className={cn(
                    isSaved && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaved ? '保存済み' : '保存'}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          {filteredPrompts.length > 1 && (
            <Card className="p-4 bg-gray-50">
              <div className="space-y-3">
                <h5 className="font-medium text-sm">振り返り進捗</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredPrompts.map(prompt => {
                    const hasContent = reflections[prompt.id]?.length > 0;
                    const wordCount = wordCounts[prompt.id] || 0;
                    const meetsMin = !prompt.minWords || wordCount >= prompt.minWords;
                    
                    return (
                      <div key={prompt.id} className="text-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-medium",
                          hasContent && meetsMin ? "bg-green-100 text-green-800" :
                          hasContent ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-200 text-gray-600"
                        )}>
                          {hasContent && meetsMin ? '✓' : wordCount || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">{prompt.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}