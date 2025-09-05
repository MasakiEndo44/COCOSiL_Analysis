'use client';

import { useState } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Brain, 
  Heart, 
  Activity, 
 
  Users, 
  Target,
  Lightbulb,
  Palette,
  Shuffle,
  Globe
} from 'lucide-react';

const TAIHEKI_TYPES = [
  {
    id: 1,
    name: '1種（上下・上）',
    category: '上下型',
    icon: Brain,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    characteristics: ['理論的思考', '完璧主義', '頭脳明晰', '計画性'],
    description: '頭部重心で理論的な思考を重視するタイプ',
    bodyFeatures: ['首が長い', '頭が大きい', '上半身重心', '姿勢が良い'],
    mentalTraits: ['論理的', '分析的', '慎重', '責任感が強い']
  },
  {
    id: 2,
    name: '2種（上下・下）',
    category: '上下型',
    icon: Target,
    color: 'bg-red-400',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    characteristics: ['集中力', '持続力', '分析力', '慎重さ'],
    description: '下腹部重心で集中力に優れるタイプ',
    bodyFeatures: ['下半身重心', '腰が安定', '座っているのが楽', '足腰が強い'],
    mentalTraits: ['集中力が高い', '粘り強い', '内向的', '思慮深い']
  },
  {
    id: 3,
    name: '3種（左右・左）',
    category: '左右型',
    icon: Heart,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    characteristics: ['感情豊か', '共感力', '人情味', '感受性'],
    description: '感情を重視し、人間関係を大切にするタイプ',
    bodyFeatures: ['左肩が下がる', '左重心', '表情豊か', '身振り手振り'],
    mentalTraits: ['感情的', '共感力が高い', '社交的', '人間関係重視']
  },
  {
    id: 4,
    name: '4種（左右・右）',
    category: '左右型',
    icon: Palette,
    color: 'bg-blue-400',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    characteristics: ['直感的', '芸術的', '感性', '創造性'],
    description: '直感と感性を重視するタイプ',
    bodyFeatures: ['右肩が下がる', '右重心', '動きが優雅', 'バランス感覚'],
    mentalTraits: ['直感的', '芸術的センス', '感性豊か', '美的感覚']
  },
  {
    id: 5,
    name: '5種（前後・前）',
    category: '前後型',
    icon: Activity,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    characteristics: ['行動力', 'リーダーシップ', '積極性', '実行力'],
    description: '行動を重視し、リーダーシップを発揮するタイプ',
    bodyFeatures: ['前傾姿勢', '胸板が厚い', '歩幅が大きい', '力強い動き'],
    mentalTraits: ['行動的', 'リーダー気質', '積極的', '決断力がある']
  },
  {
    id: 6,
    name: '6種（前後・後）',
    category: '前後型',
    icon: Target,
    color: 'bg-green-400',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    characteristics: ['継続力', '現実的', '忍耐力', '安定性'],
    description: '継続性と安定性を重視するタイプ',
    bodyFeatures: ['後ろ重心', '腰が据わる', 'どっしりした体型', '安定した歩き'],
    mentalTraits: ['継続力がある', '現実的', '忍耐強い', '安定志向']
  },
  {
    id: 7,
    name: '7種（捻れ・左）',
    category: '捻れ型',
    icon: Shuffle,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    characteristics: ['変化好き', '創造性', '柔軟性', '独創性'],
    description: '変化と創造を好むタイプ',
    bodyFeatures: ['体の捻れ', '左回転の動き', '柔軟な体', 'しなやかな動き'],
    mentalTraits: ['変化を好む', '創造的', '柔軟', '独創的']
  },
  {
    id: 8,
    name: '8種（捻れ・右）',
    category: '捻れ型',
    icon: Lightbulb,
    color: 'bg-purple-400',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    characteristics: ['革新的', '自由奔放', '発想力', '独立性'],
    description: '革新と自由を重視するタイプ',
    bodyFeatures: ['右回転の動き', '体の捻れ', '動きが特徴的', '独特のリズム'],
    mentalTraits: ['革新的', '自由奔放', '発想豊か', '独立志向']
  },
  {
    id: 9,
    name: '9種（開閉・開）',
    category: '開閉型',
    icon: Users,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    characteristics: ['協調性', 'チームワーク', '社交性', '和合'],
    description: '協調性を重視し、チームワークを大切にするタイプ',
    bodyFeatures: ['開いた姿勢', '親しみやすい表情', '手足を広げる', 'オープンな動き'],
    mentalTraits: ['協調性がある', '社交的', 'チームワーク重視', '和を大切にする']
  },
  {
    id: 10,
    name: '10種（開閉・閉）',
    category: '開閉型',
    icon: Globe,
    color: 'bg-orange-400',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    characteristics: ['集団統率', '責任感', '包容力', '安定'],
    description: '集団をまとめ、責任感の強いタイプ',
    bodyFeatures: ['まとまった体型', '中心に集まる動き', '安定した姿勢', '落ち着いた動作'],
    mentalTraits: ['統率力がある', '責任感が強い', '包容力がある', '安定感がある']
  }
];

interface BodyTypeSelectorProps {
  id?: string;
  title?: string;
  onSelectionChange?: (selectedTypes: number[]) => void;
  maxSelections?: number;
  showComparison?: boolean;
}

export function BodyTypeSelector({ 
  id = 'body-type-selector',
  title = '体癖タイプを選択してください',
  onSelectionChange,
  maxSelections = 3,
  showComparison = true 
}: BodyTypeSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | '上下型' | '左右型' | '前後型' | '捻れ型' | '開閉型'>('all');
  const [showDetails, setShowDetails] = useState<number | null>(null);

  const categories = ['all', '上下型', '左右型', '前後型', '捻れ型', '開閉型'] as const;
  const filteredTypes = activeTab === 'all' ? TAIHEKI_TYPES : TAIHEKI_TYPES.filter(type => type.category === activeTab);

  const handleTypeSelect = (typeId: number) => {
    setSelectedTypes(prev => {
      let newSelection;
      if (prev.includes(typeId)) {
        newSelection = prev.filter(id => id !== typeId);
      } else if (prev.length < maxSelections) {
        newSelection = [...prev, typeId];
      } else {
        return prev; // 最大選択数に達している
      }
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  const handleShowDetails = (typeId: number) => {
    setShowDetails(showDetails === typeId ? null : typeId);
  };

  return (
    <div className="space-y-6 my-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">
              最大{maxSelections}つまで選択できます（{selectedTypes.length}/{maxSelections}）
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={activeTab === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(category)}
              >
                {category === 'all' ? 'すべて' : category}
              </Button>
            ))}
          </div>

          {/* Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTypes.map(type => {
              const isSelected = selectedTypes.includes(type.id);
              const canSelect = selectedTypes.length < maxSelections || isSelected;
              const IconComponent = type.icon;

              return (
                <div key={type.id} className="space-y-2">
                  <Card 
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200",
                      isSelected ? `${type.borderColor} ${type.bgColor} ring-2 ring-opacity-50` : "border-gray-200 hover:border-gray-300",
                      !canSelect && !isSelected && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => canSelect && handleTypeSelect(type.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? type.color : "bg-gray-100",
                        isSelected ? "text-white" : "text-gray-600"
                      )}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm">{type.name}</h4>
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              選択中
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {type.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {type.characteristics.slice(0, 2).map(char => (
                            <Badge key={char} variant="outline" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowDetails(type.id)}
                    className="w-full text-xs"
                  >
                    {showDetails === type.id ? '詳細を閉じる' : '詳細を見る'}
                  </Button>

                  {/* Detailed Information */}
                  {showDetails === type.id && (
                    <Card className={cn("p-4", type.bgColor, type.borderColor)}>
                      <div className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold mb-2">身体的特徴</h5>
                          <ul className="text-xs space-y-1">
                            {type.bodyFeatures.map(feature => (
                              <li key={feature} className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">精神的特徴</h5>
                          <ul className="text-xs space-y-1">
                            {type.mentalTraits.map(trait => (
                              <li key={trait} className="flex items-center space-x-1">
                                <span className="w-1 h-1 bg-current rounded-full"></span>
                                <span>{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Types Summary */}
          {selectedTypes.length > 0 && showComparison && (
            <Card className="p-4 bg-brand-50 border-brand-200">
              <h4 className="font-semibold mb-3 text-brand-800">選択中の体癖タイプ</h4>
              <div className="space-y-2">
                {selectedTypes.map(typeId => {
                  const type = TAIHEKI_TYPES.find(t => t.id === typeId)!;
                  return (
                    <div key={typeId} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type.name}</span>
                      <div className="flex flex-wrap gap-1">
                        {type.characteristics.slice(0, 3).map(char => (
                          <Badge key={char} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedTypes.length >= 2 && (
                <div className="mt-3 p-3 bg-white rounded border text-xs text-muted-foreground">
                  <p>
                    選択したタイプの組み合わせにより、より詳細な個性の分析が可能です。
                    主体癖と副体癖の関係性を理解することで、自己理解が深まります。
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}