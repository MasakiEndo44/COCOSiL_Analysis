'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Textarea } from '@/ui/components/ui/textarea';
import { Badge } from '@/ui/components/ui/badge';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast'; // Temporarily commented out
import { DiagnosisRecord } from '@/types/admin';
import { FULL_ANIMAL_OPTIONS, getOrientationByCharacter, ORIENTATION_LABELS } from '@/lib/data/animal-fortune-mapping';

// 強化されたバリデーションスキーマ
const recordEditSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  birthDate: z.string()
    .min(1, '生年月日は必須です')
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, '生年月日はYYYY/MM/DD形式で入力してください')
    .refine((date) => {
      const parsed = new Date(date);
      const today = new Date();
      return parsed <= today;
    }, '生年月日は過去の日付を入力してください'),
  age: z.coerce.number().int().min(1, '年齢は1歳以上で入力してください').max(120, '年齢は120歳以下で入力してください'),
  gender: z.enum(['male', 'female', 'no_answer'], { required_error: '性別を選択してください' }),
  zodiac: z.string().min(1, '星座を選択してください'),
  animal: z.string().min(1, '動物占いを選択してください'),
  orientation: z.string().min(1, '志向を選択してください'),
  color: z.string().min(1, '色は必須です'),
  mbti: z.enum([
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP', 
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ], { required_error: 'MBTIタイプを選択してください' }),
  mainTaiheki: z.coerce.number().int().min(1, '主体癖は1-12で選択してください').max(12, '主体癖は1-12で選択してください'),
  subTaiheki: z.preprocess((val) => val === 'none' || val === '' || val === 0 || val === undefined ? null : val, z.coerce.number().int().min(1).max(12).optional().nullable()),
  sixStar: z.string().min(1, '6星占術を選択してください'),
  theme: z.string().min(1, 'テーマは必須です'),
  advice: z.string().min(1, 'アドバイスは必須です'),
  satisfaction: z.coerce.number().int().min(1, '満足度は1-5で選択してください').max(5, '満足度は1-5で選択してください'),
  duration: z.string().min(1, '所要時間は必須です'),
  feedback: z.string().min(1, 'フィードバックは必須です'),
  reportUrl: z.string().optional(),
  interviewScheduled: z.string().optional(),
  interviewDone: z.string().optional(),
  memo: z.string().optional(),
});

type RecordEditFormData = z.infer<typeof recordEditSchema>;

interface RecordEditFormProps {
  record: DiagnosisRecord;
}

// 定数データ
const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP', 
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const zodiacSigns = [
  '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座',
  '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'
];

const sixStarTypes = [
  '土星人+', '土星人-', '金星人+', '金星人-', '火星人+', '火星人-',
  '天王星人+', '天王星人-', '木星人+', '木星人-', '水星人+', '水星人-'
];

// 志向の選択肢を正しいマッピングデータから生成
const orientationOptions = Object.entries(ORIENTATION_LABELS).map(([value, label]) => ({
  value,
  label
}));

// 年齢自動計算ユーティリティ
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export function RecordEditForm({ record }: RecordEditFormProps) {
  const router = useRouter();
  // const { toast } = useToast(); // Temporarily commented out
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<RecordEditFormData>({
    resolver: zodResolver(recordEditSchema),
    defaultValues: {
      name: record.name,
      birthDate: record.birthDate,
      age: record.age,
      gender: record.gender as 'male' | 'female' | 'no_answer',
      zodiac: record.zodiac,
      animal: record.animal,
      orientation: record.orientation || getOrientationByCharacter(record.animal) || '',
      color: record.color,
      mbti: record.mbti as any,
      mainTaiheki: record.mainTaiheki,
      subTaiheki: record.subTaiheki === 0 || record.subTaiheki === '' || record.subTaiheki === undefined ? null : record.subTaiheki,
      sixStar: record.sixStar,
      theme: record.theme,
      advice: record.advice,
      satisfaction: record.satisfaction,
      duration: record.duration,
      feedback: record.feedback,
      reportUrl: record.reportUrl || '',
      interviewScheduled: record.interviewScheduled || '',
      interviewDone: record.interviewDone || '',
      memo: record.memo || '',
    },
  });

  const { watch, setValue, formState: { isDirty, errors } } = form;
  const watchBirthDate = watch('birthDate');
  const watchAnimal = watch('animal');

  // 生年月日変更時の年齢自動計算
  useEffect(() => {
    if (watchBirthDate && /^\d{4}\/\d{2}\/\d{2}$/.test(watchBirthDate)) {
      const calculatedAge = calculateAge(watchBirthDate);
      if (calculatedAge > 0) {
        setValue('age', calculatedAge);
      }
    }
  }, [watchBirthDate, setValue]);

  // 動物占い変更時の志向自動設定
  useEffect(() => {
    if (watchAnimal) {
      const orientation = getOrientationByCharacter(watchAnimal);
      if (orientation) {
        setValue('orientation', orientation);
      }
    }
  }, [watchAnimal, setValue]);

  // 未保存変更の追跡
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // 保存処理
  const onSubmit = async (data: RecordEditFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/records/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '保存に失敗しました');
      }

      alert('保存完了: 診断記録が正常に更新されました');

      setHasUnsavedChanges(false);
      
      // 保存後の選択肢を提供
      const continueEditing = confirm('保存が完了しました。編集を続けますか？\n\n「OK」: 編集を続ける\n「キャンセル」: 一覧に戻る');
      if (!continueEditing) {
        router.push('/admin');
      }

    } catch (error) {
      console.error('保存エラー:', error);
      alert(`保存エラー: ${error instanceof Error ? error.message : '保存中にエラーが発生しました'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* 保存ボタン（上部） */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              未保存の変更あり
            </Badge>
          )}
          {Object.keys(errors).length > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              {Object.keys(errors).length}件のエラー
            </Badge>
          )}
        </div>
        <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存
            </>
          )}
        </Button>
      </div>

      {/* 概要サマリー */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            記録概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">作成日:</span>
              <p>{record.date}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">レコードID:</span>
              <p>{record.id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">最終更新:</span>
              <p>{new Date(record.updatedAt).toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">満足度:</span>
              <p>{record.satisfaction}/5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">名前 *</Label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="名前を入力"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">生年月日 *</Label>
              <Controller
                name="birthDate"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="birthDate"
                    placeholder="YYYY/MM/DD"
                    className={errors.birthDate ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-600 mt-1">{errors.birthDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="age">年齢 *</Label>
              <Controller
                name="age"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    className={errors.age ? 'border-red-500' : ''}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                )}
              />
              {errors.age && (
                <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">生年月日を入力すると自動計算されます</p>
            </div>

            <div>
              <Label htmlFor="gender">性別 *</Label>
              <Controller
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="性別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男性</SelectItem>
                      <SelectItem value="female">女性</SelectItem>
                      <SelectItem value="no_answer">回答しない</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && (
                <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 占い・診断結果 */}
      <Card>
        <CardHeader>
          <CardTitle>占い・診断結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zodiac">星座 *</Label>
              <Controller
                name="zodiac"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.zodiac ? 'border-red-500' : ''}>
                      <SelectValue placeholder="星座を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {zodiacSigns.map((zodiac) => (
                        <SelectItem key={zodiac} value={zodiac}>{zodiac}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.zodiac && (
                <p className="text-sm text-red-600 mt-1">{errors.zodiac.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="animal">動物占い *</Label>
              <Controller
                name="animal"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.animal ? 'border-red-500' : ''}>
                      <SelectValue placeholder="動物を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {FULL_ANIMAL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.animal && (
                <p className="text-sm text-red-600 mt-1">{errors.animal.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="orientation">志向 *</Label>
              <Controller
                name="orientation"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.orientation ? 'border-red-500' : ''}>
                      <SelectValue placeholder="志向を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.orientation && (
                <p className="text-sm text-red-600 mt-1">{errors.orientation.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">動物を選択すると自動設定されます</p>
            </div>

            <div>
              <Label htmlFor="mbti">MBTIタイプ *</Label>
              <Controller
                name="mbti"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.mbti ? 'border-red-500' : ''}>
                      <SelectValue placeholder="MBTIを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mbtiTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mbti && (
                <p className="text-sm text-red-600 mt-1">{errors.mbti.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mainTaiheki">主体癖 *</Label>
              <Controller
                name="mainTaiheki"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <SelectTrigger className={errors.mainTaiheki ? 'border-red-500' : ''}>
                      <SelectValue placeholder="主体癖を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}種</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mainTaiheki && (
                <p className="text-sm text-red-600 mt-1">{errors.mainTaiheki.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subTaiheki">副体癖</Label>
              <Controller
                name="subTaiheki"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value?.toString() || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="副体癖を選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">なし</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num}種</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="sixStar">6星占術 *</Label>
              <Controller
                name="sixStar"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.sixStar ? 'border-red-500' : ''}>
                      <SelectValue placeholder="6星占術を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {sixStarTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sixStar && (
                <p className="text-sm text-red-600 mt-1">{errors.sixStar.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="color">色 *</Label>
              <Controller
                name="color"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="color"
                    placeholder="色を入力"
                    className={errors.color ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.color && (
                <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* セッション情報 */}
      <Card>
        <CardHeader>
          <CardTitle>セッション情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">テーマ *</Label>
              <Controller
                name="theme"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="theme"
                    placeholder="テーマを入力"
                    className={errors.theme ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.theme && (
                <p className="text-sm text-red-600 mt-1">{errors.theme.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">所要時間 *</Label>
              <Controller
                name="duration"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="duration"
                    placeholder="例: 45分"
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="satisfaction">満足度 *</Label>
              <Controller
                name="satisfaction"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <SelectTrigger className={errors.satisfaction ? 'border-red-500' : ''}>
                      <SelectValue placeholder="満足度を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} - {'★'.repeat(num)}{'☆'.repeat(5-num)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.satisfaction && (
                <p className="text-sm text-red-600 mt-1">{errors.satisfaction.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reportUrl">レポートURL</Label>
              <Controller
                name="reportUrl"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reportUrl"
                    type="url"
                    placeholder="https://..."
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="interviewScheduled">面談予定</Label>
              <Controller
                name="interviewScheduled"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="interviewScheduled"
                    placeholder="例: 2024/01/15"
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="interviewDone">面談完了</Label>
              <Controller
                name="interviewDone"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="interviewDone"
                    placeholder="例: 2024/01/15"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="advice">アドバイス *</Label>
            <Controller
              name="advice"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="advice"
                  rows={3}
                  placeholder="アドバイスを入力"
                  className={errors.advice ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.advice && (
              <p className="text-sm text-red-600 mt-1">{errors.advice.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="feedback">フィードバック *</Label>
            <Controller
              name="feedback"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="feedback"
                  rows={3}
                  placeholder="フィードバックを入力"
                  className={errors.feedback ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.feedback && (
              <p className="text-sm text-red-600 mt-1">{errors.feedback.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="memo">メモ</Label>
            <Controller
              name="memo"
              control={form.control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="memo"
                  rows={4}
                  placeholder="追加のメモや備考"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン（下部） */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              未保存の変更あり
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/admin')}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading || Object.keys(errors).length > 0}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}