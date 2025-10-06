'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';
import { TAIHEKI_COMPARISON_DATA, compareTypes, type TaihekiTypeComparison } from '@/lib/data/taiheki-comparison-data';
import { cn } from '@/lib/utils';

interface TypeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTypes?: number[];  // 初期選択タイプ（ユーザーの主体癖など）
}

/**
 * タイプ比較モーダル
 *
 * 複数の体癖タイプを横並びで比較表示するモーダルコンポーネント。
 * 最大3タイプまで同時比較可能。
 */
export function TypeComparisonModal({ isOpen, onClose, initialTypes = [] }: TypeComparisonModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<number[]>(initialTypes.slice(0, 3));

  const comparisonData = compareTypes(selectedTypes);
  const availableTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(
    (type) => !selectedTypes.includes(type)
  );

  const toggleType = (type: number) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else if (selectedTypes.length < 3) {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">体癖タイプ比較</DialogTitle>
            <Button variant="tertiary" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            最大3タイプまで選択して、相違点を比較できます
          </p>
        </DialogHeader>

        {/* タイプ選択エリア */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((type) => {
              const isSelected = selectedTypes.includes(type);
              const isDisabled = !isSelected && selectedTypes.length >= 3;
              const typeData = TAIHEKI_COMPARISON_DATA[type];

              return (
                <Button
                  key={type}
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "min-w-[100px]",
                    isSelected && "bg-brand-600 hover:bg-brand-700"
                  )}
                >
                  {typeData.emoji} {type}種
                  {isSelected ? (
                    <Minus className="w-3 h-3 ml-1" />
                  ) : (
                    <Plus className="w-3 h-3 ml-1" />
                  )}
                </Button>
              );
            })}
          </div>

          {selectedTypes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              比較するタイプを選択してください
            </div>
          )}
        </div>

        {/* 比較テーブル */}
        {comparisonData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, minmax(250px, 1fr))` }}>
              {comparisonData.map((typeData) => (
                <ComparisonCard key={typeData.type} data={typeData} />
              ))}
            </div>

            {/* 比較表（詳細） */}
            <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">
                      項目
                    </th>
                    {comparisonData.map((typeData) => (
                      <th key={typeData.type} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {typeData.emoji} {typeData.type}種
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <ComparisonRow
                    label="カテゴリー"
                    values={comparisonData.map((d) => d.category)}
                  />
                  <ComparisonRow
                    label="サブカテゴリー"
                    values={comparisonData.map((d) => d.subcategory)}
                  />
                  <ComparisonRow
                    label="思考スタイル"
                    values={comparisonData.map((d) => d.thinkingStyle)}
                  />
                  <ComparisonRow
                    label="行動スタイル"
                    values={comparisonData.map((d) => d.actionStyle)}
                  />
                  <ComparisonRow
                    label="コミュニケーション"
                    values={comparisonData.map((d) => d.communication)}
                  />
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">主な特徴</td>
                    {comparisonData.map((typeData) => (
                      <td key={typeData.type} className="px-4 py-3">
                        <ul className="text-sm text-gray-600 space-y-1">
                          {typeData.keyTraits.map((trait, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-2" />
                              {trait}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * 比較カードコンポーネント（概要表示）
 */
function ComparisonCard({ data }: { data: TaihekiTypeComparison }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="text-center mb-3">
        <div className="text-4xl mb-2">{data.emoji}</div>
        <h3 className="font-bold text-lg text-gray-900">{data.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{data.subcategory}</p>
      </div>
      <p className="text-sm text-gray-700 text-center mb-3">{data.shortDescription}</p>
      <div className="space-y-1">
        {data.keyTraits.map((trait, index) => (
          <div key={index} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded text-center">
            {trait}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 比較テーブル行コンポーネント
 */
function ComparisonRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
        {label}
      </td>
      {values.map((value, index) => (
        <td key={index} className="px-4 py-3 text-sm text-gray-600 text-center">
          {value}
        </td>
      ))}
    </tr>
  );
}
