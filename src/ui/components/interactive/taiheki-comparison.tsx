'use client';

import { useState } from 'react';
import { Card } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { cn } from '@/lib/utils';
import { Zap, Users } from 'lucide-react';

interface TaihekiType {
  id: number;
  name: string;
  category: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  compatibility: number[];
  workStyle: string;
  stressResponse: string;
  communication: string;
}

const TAIHEKI_DATA: TaihekiType[] = [
  {
    id: 1,
    name: '1種（上下・上）',
    category: '上下型',
    characteristics: ['理論的思考', '完璧主義', '計画性', '責任感'],
    strengths: ['論理的分析', '体系的思考', '品質管理', '計画立案'],
    challenges: ['柔軟性不足', '完璧主義による遅延', '感情面の軽視'],
    compatibility: [2, 9, 10],
    workStyle: '計画的で体系的なアプローチを好む',
    stressResponse: '頭痛や首の緊張として現れやすい',
    communication: '論理的で正確な表現を重視'
  },
  {
    id: 2,
    name: '2種（上下・下）',
    category: '上下型',
    characteristics: ['集中力', '持続力', '慎重さ', '内省性'],
    strengths: ['深い集中', '継続的作業', '細部への注意', '安定性'],
    challenges: ['決断の遅さ', '変化への抵抗', '社交性の低さ'],
    compatibility: [1, 6, 10],
    workStyle: '一つのことに深く集中する',
    stressResponse: '腰痛や消化器系の不調',
    communication: '慎重で控えめな表現'
  },
  {
    id: 3,
    name: '3種（左右・左）',
    category: '左右型',
    characteristics: ['感情豊か', '共感力', '社交性', '人情味'],
    strengths: ['人間関係構築', 'チームワーク', '感情的サポート', '調和'],
    challenges: ['感情的判断', '決断の困難', 'ストレス耐性の低さ'],
    compatibility: [4, 5, 9],
    workStyle: '人との関わりを重視した協働',
    stressResponse: '胸部の圧迫感や動悸',
    communication: '感情的で親しみやすい表現'
  },
  {
    id: 4,
    name: '4種（左右・右）',
    category: '左右型',
    characteristics: ['直感的', '芸術的', '感受性', '創造性'],
    strengths: ['創造的発想', '美的センス', '直感的判断', '独創性'],
    challenges: ['論理性不足', '気分の変動', '持続力の低さ'],
    compatibility: [3, 7, 8],
    workStyle: '自由で創造的な環境を好む',
    stressResponse: '右半身の緊張や頭痛',
    communication: '感性的で表現豊かな話し方'
  },
  {
    id: 5,
    name: '5種（前後・前）',
    category: '前後型',
    characteristics: ['行動力', 'リーダーシップ', '積極性', '決断力'],
    strengths: ['迅速な行動', 'リーダーシップ', '積極的推進', '決断力'],
    challenges: ['性急さ', '周囲への配慮不足', '燃え尽き症候群'],
    compatibility: [6, 9, 10],
    workStyle: '積極的で主導的なアプローチ',
    stressResponse: '胸部や心臓への負荷',
    communication: '直接的で力強い表現'
  },
  {
    id: 6,
    name: '6種（前後・後）',
    category: '前後型',
    characteristics: ['継続力', '現実的', '忍耐力', '安定性'],
    strengths: ['継続的努力', '現実的判断', '忍耐力', '安定性'],
    challenges: ['変化への対応', '積極性不足', '保守的思考'],
    compatibility: [2, 5, 10],
    workStyle: '着実で継続的な取り組み',
    stressResponse: '腰部や下半身の重だるさ',
    communication: '控えめで実用的な表現'
  },
  {
    id: 7,
    name: '7種（捻れ・左）',
    category: '捻れ型',
    characteristics: ['変化好き', '創造性', '柔軟性', '適応力'],
    strengths: ['変化への適応', '創造的解決', '柔軟な思考', '多様性'],
    challenges: ['一貫性不足', '飽きやすさ', '計画性の欠如'],
    compatibility: [4, 8, 9],
    workStyle: '変化に富んだ多様な業務を好む',
    stressResponse: '全身の緊張やバランス不良',
    communication: '変化に富んだ表現豊かな話し方'
  },
  {
    id: 8,
    name: '8種（捻れ・右）',
    category: '捻れ型',
    characteristics: ['革新的', '自由奔放', '独創性', '独立性'],
    strengths: ['革新的アイデア', '独創的解決', '自立性', '変革力'],
    challenges: ['協調性不足', '一般常識からの逸脱', '孤立しがち'],
    compatibility: [4, 7, 10],
    workStyle: '自由で独立した環境を好む',
    stressResponse: '神経系の緊張や睡眠障害',
    communication: '独特で個性的な表現'
  },
  {
    id: 9,
    name: '9種（開閉・開）',
    category: '開閉型',
    characteristics: ['協調性', '社交性', 'チームワーク', '和合'],
    strengths: ['チーム統合', '協調的作業', '社交性', '調整力'],
    challenges: ['自己主張不足', '優柔不断', '他者依存傾向'],
    compatibility: [1, 3, 5, 7],
    workStyle: 'チームワークを重視した協働',
    stressResponse: '全身の散漫な疲労感',
    communication: '協調的で和やかな表現'
  },
  {
    id: 10,
    name: '10種（開閉・閉）',
    category: '開閉型',
    characteristics: ['統率力', '責任感', '包容力', '安定感'],
    strengths: ['組織統率', '責任ある判断', '包容力', 'まとめ役'],
    challenges: ['固定観念', '変化への抵抗', '重責によるストレス'],
    compatibility: [1, 2, 5, 6, 8],
    workStyle: '組織全体を見渡した統括的な業務',
    stressResponse: '肩や全身の重圧感',
    communication: '責任感のある安定した表現'
  }
];

interface TaihekiComparisonProps {
  id?: string;
  defaultTypes?: number[];
  showCompatibility?: boolean;
}

export function TaihekiComparison({ 
  id = 'taiheki-comparison',
  defaultTypes = [1, 3],
  showCompatibility = true 
}: TaihekiComparisonProps) {
  const [selectedTypes, setSelectedTypes] = useState<number[]>(defaultTypes);
  const [comparisonAspect, setComparisonAspect] = useState<'strengths' | 'challenges' | 'workStyle' | 'communication'>('strengths');

  const typeOptions = TAIHEKI_DATA.map(type => ({
    value: type.id,
    label: type.name
  }));

  const getTypeData = (typeId: number) => TAIHEKI_DATA.find(t => t.id === typeId);

  const handleTypeChange = (index: number, newTypeId: number) => {
    const newTypes = [...selectedTypes];
    newTypes[index] = newTypeId;
    setSelectedTypes(newTypes);
  };

  const addComparison = () => {
    if (selectedTypes.length < 3) {
      const unusedType = TAIHEKI_DATA.find(type => !selectedTypes.includes(type.id));
      if (unusedType) {
        setSelectedTypes([...selectedTypes, unusedType.id]);
      }
    }
  };

  const removeComparison = (index: number) => {
    if (selectedTypes.length > 2) {
      setSelectedTypes(selectedTypes.filter((_, i) => i !== index));
    }
  };

  const getCompatibilityLevel = (type1Id: number, type2Id: number) => {
    const type1 = getTypeData(type1Id);
    if (!type1) return 'unknown';
    
    if (type1.compatibility.includes(type2Id)) return 'high';
    if (Math.abs(type1Id - type2Id) <= 2) return 'medium';
    return 'low';
  };

  const compatibilityColors = {
    high: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const compatibilityLabels = {
    high: '相性良好',
    medium: '普通',
    low: '要注意',
    unknown: '不明'
  };

  return (
    <div className="space-y-6 my-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">体癖タイプ比較分析</h3>
            <p className="text-sm text-muted-foreground">
              異なる体癖タイプの特徴を比較して理解を深めましょう
            </p>
          </div>

          {/* Type Selection */}
          <div className="flex flex-wrap gap-4 justify-center">
            {selectedTypes.map((typeId, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={typeId}
                  onChange={(e) => handleTypeChange(index, parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  {typeOptions.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      disabled={selectedTypes.includes(option.value) && option.value !== typeId}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {selectedTypes.length > 2 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeComparison(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    削除
                  </Button>
                )}
              </div>
            ))}
            
            {selectedTypes.length < 3 && (
              <Button
                size="sm"
                variant="outline"
                onClick={addComparison}
              >
                + 追加
              </Button>
            )}
          </div>

          {/* Compatibility Matrix */}
          {showCompatibility && selectedTypes.length >= 2 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                相性マトリックス
              </h4>
              <div className="grid gap-2">
                {selectedTypes.map((type1Id, i) => 
                  selectedTypes.slice(i + 1).map((type2Id, j) => {
                    const compatibility = getCompatibilityLevel(type1Id, type2Id);
                    const type1Name = getTypeData(type1Id)?.name.split('（')[0];
                    const type2Name = getTypeData(type2Id)?.name.split('（')[0];
                    
                    return (
                      <div key={`${type1Id}-${type2Id}`} className="flex items-center justify-between text-sm">
                        <span>{type1Name} × {type2Name}</span>
                        <Badge 
                          className={cn('text-xs', compatibilityColors[compatibility])}
                          variant="outline"
                        >
                          {compatibilityLabels[compatibility]}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          )}

          {/* Comparison Aspect Selection */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: 'strengths', label: '強み' },
              { key: 'challenges', label: '課題' },
              { key: 'workStyle', label: '仕事スタイル' },
              { key: 'communication', label: 'コミュニケーション' }
            ].map(aspect => (
              <Button
                key={aspect.key}
                size="sm"
                variant={comparisonAspect === aspect.key ? "default" : "outline"}
                onClick={() => setComparisonAspect(aspect.key as any)}
              >
                {aspect.label}
              </Button>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedTypes.length}, 1fr)` }}>
              {selectedTypes.map(typeId => {
                const typeData = getTypeData(typeId);
                if (!typeData) return null;

                let content: React.ReactNode;
                if (comparisonAspect === 'strengths' || comparisonAspect === 'challenges') {
                  content = (
                    <ul className="space-y-1">
                      {typeData[comparisonAspect].map((item, i) => (
                        <li key={i} className="flex items-start space-x-1 text-sm">
                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                } else {
                  content = (
                    <p className="text-sm text-muted-foreground">
                      {typeData[comparisonAspect]}
                    </p>
                  );
                }

                return (
                  <Card key={typeId} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm">{typeData.name}</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {typeData.category}
                        </Badge>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2 text-brand-600">
                          {comparisonAspect === 'strengths' && '強み'}
                          {comparisonAspect === 'challenges' && '課題'}
                          {comparisonAspect === 'workStyle' && '仕事スタイル'}
                          {comparisonAspect === 'communication' && 'コミュニケーション'}
                        </h5>
                        {content}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <Card className="p-4 bg-brand-50 border-brand-200">
            <h4 className="font-semibold mb-2 text-brand-800 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              比較からの洞察
            </h4>
            <div className="text-sm text-brand-700 space-y-2">
              <p>
                選択した体癖タイプ間の違いを理解することで、以下の気づきが得られます：
              </p>
              <ul className="space-y-1 ml-4">
                <li>• 自分と他者の行動パターンの違い</li>
                <li>• 効果的なコミュニケーション方法</li>
                <li>• チームでの役割分担の最適化</li>
                <li>• ストレス要因と対処法の違い</li>
              </ul>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}