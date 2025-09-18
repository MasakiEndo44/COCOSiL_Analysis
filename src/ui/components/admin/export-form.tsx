'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { ExportOptions } from '@/types/admin';

interface ExportFormProps {
  onExport: (options: ExportOptions) => Promise<void>;
  isLoading?: boolean;
}

export function ExportForm({ onExport, isLoading = false }: ExportFormProps) {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeMasterData, setIncludeMasterData] = useState(false);
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const exportOptions: ExportOptions = {
      format,
      includeStats,
      includeMasterData,
      dateRange: useDateRange && startDate && endDate ? {
        start: startDate,
        end: endDate,
      } : undefined,
    };

    await onExport(exportOptions);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>データエクスポート</CardTitle>
          <CardDescription>
            診断記録データを Excel または CSV 形式でダウンロードできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 出力形式 */}
            <div className="space-y-2">
              <Label>出力形式</Label>
              <Select value={format} onValueChange={(value: 'excel' | 'csv') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 含めるデータ */}
            <div className="space-y-3">
              <Label>含めるデータ</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStats"
                  checked={includeStats}
                  onCheckedChange={(checked) => setIncludeStats(checked as boolean)}
                />
                <Label htmlFor="includeStats" className="text-sm font-normal">
                  統計データを含める
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMasterData"
                  checked={includeMasterData}
                  onCheckedChange={(checked) => setIncludeMasterData(checked as boolean)}
                />
                <Label htmlFor="includeMasterData" className="text-sm font-normal">
                  マスターデータを含める
                </Label>
              </div>
            </div>

            {/* 日付範囲 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useDateRange"
                  checked={useDateRange}
                  onCheckedChange={(checked) => setUseDateRange(checked as boolean)}
                />
                <Label htmlFor="useDateRange" className="text-sm font-normal">
                  日付範囲を指定する
                </Label>
              </div>

              {useDateRange && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="startDate">開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required={useDateRange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required={useDateRange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* データ概要 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">エクスポート内容</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 診断記録データ（メイン）</li>
                {includeStats && <li>• 統計データ（性別・MBTI・満足度分布など）</li>}
                {includeMasterData && <li>• マスターデータ（動物占い・MBTI・体癖情報）</li>}
                {useDateRange && startDate && endDate && (
                  <li>• 日付範囲: {startDate} ～ {endDate}</li>
                )}
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || (useDateRange && (!startDate || !endDate))}
            >
              {isLoading ? 'エクスポート中...' : `${format.toUpperCase()}ファイルをダウンロード`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 注意事項 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">注意事項</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• エクスポートしたファイルには個人情報が含まれます。適切に管理してください。</p>
          <p>• 大量のデータをエクスポートする場合、時間がかかることがあります。</p>
          <p>• Excel形式では複数のシートに分けてデータが整理されます。</p>
          <p>• CSV形式では診断記録のみが出力されます。</p>
        </CardContent>
      </Card>
    </div>
  );
}