'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Root as Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { Textarea } from '@/ui/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/components/ui/dialog';
import { DiagnosisRecord } from '@/types/admin';
import { FULL_ANIMAL_OPTIONS, getOrientationByCharacter } from '@/lib/data/animal-fortune-mapping';

const recordSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  birthDate: z.string().min(1, '生年月日は必須です'),
  age: z.number().min(1, '年齢は必須です').max(120, '有効な年齢を入力してください'),
  gender: z.enum(['male', 'female', 'no_answer'], { required_error: '性別を選択してください' }),
  zodiac: z.string().min(1, '星座は必須です'),
  animal: z.string().min(1, '動物占いは必須です'),
  orientation: z.string().min(1, '志向は必須です'),
  color: z.string().min(1, '色は必須です'),
  mbti: z.string().min(1, 'MBTIタイプは必須です'),
  mainTaiheki: z.number().min(1, '主体癖は必須です').max(12, '1-12の値を入力してください'),
  subTaiheki: z.number().optional(),
  sixStar: z.string().min(1, '6星占術は必須です'),
  theme: z.string().min(1, 'テーマは必須です'),
  advice: z.string().min(1, 'アドバイスは必須です'),
  satisfaction: z.number().min(1, '満足度は1-5で選択してください').max(5, '満足度は1-5で選択してください'),
  duration: z.string().min(1, '所要時間は必須です'),
  feedback: z.string().min(1, 'フィードバックは必須です'),
  reportUrl: z.string().optional(),
  interviewScheduled: z.string().optional(),
  interviewDone: z.string().optional(),
  memo: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: DiagnosisRecord | null;
  onSubmit: (data: RecordFormData & { date?: string }) => Promise<void>;
  isLoading?: boolean;
}

const mbtiTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// 60 animal characters are imported from FULL_ANIMAL_OPTIONS

const colors = ['金', '銀', '赤', '青', '黄', '緑', '茶', '紫', '黒', '白'];

const zodiacSigns = [
  '牡羊座', '牡牛座', '双子座', '蟹座', '獅子座', '乙女座',
  '天秤座', '蠍座', '射手座', '山羊座', '水瓶座', '魚座'
];

const sixStars = [
  '土星+', '土星-', '金星+', '金星-', '火星+', '火星-',
  '天王星+', '天王星-', '木星+', '木星-', '水星+', '水星-'
];

export function RecordFormModal({ isOpen, onClose, record, onSubmit, isLoading = false }: RecordFormModalProps) {
  const isEditMode = !!record;
  
  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      age: 0,
      gender: 'no_answer',
      zodiac: '',
      animal: '',
      orientation: 'people_oriented',
      color: '',
      mbti: '',
      mainTaiheki: 1,
      subTaiheki: undefined,
      sixStar: '',
      theme: '',
      advice: '',
      satisfaction: 5,
      duration: '',
      feedback: '',
      reportUrl: '',
      interviewScheduled: '',
      interviewDone: '',
      memo: '',
    },
  });

  useEffect(() => {
    if (record && isOpen) {
      form.reset({
        name: record.name,
        birthDate: record.birthDate,
        age: record.age,
        gender: record.gender as 'male' | 'female' | 'no_answer',
        zodiac: record.zodiac,
        animal: record.animal,
        orientation: record.orientation as 'people_oriented' | 'castle_oriented' | 'big_vision_oriented',
        color: record.color,
        mbti: record.mbti,
        mainTaiheki: record.mainTaiheki,
        subTaiheki: record.subTaiheki || undefined,
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
      });
    } else if (!isEditMode && isOpen) {
      form.reset({
        name: '',
        birthDate: '',
        age: 0,
        gender: 'no_answer',
        zodiac: '',
        animal: '',
        orientation: 'people_oriented',
        color: '',
        mbti: '',
        mainTaiheki: 1,
        subTaiheki: undefined,
        sixStar: '',
        theme: '',
        advice: '',
        satisfaction: 5,
        duration: '',
        feedback: '',
        reportUrl: '',
        interviewScheduled: '',
        interviewDone: '',
        memo: '',
      });
    }
  }, [record, isOpen, isEditMode, form]);

  const handleSubmit = async (data: RecordFormData) => {
    const submitData = {
      ...data,
      date: isEditMode ? record?.date : new Date().toISOString().split('T')[0],
    };
    await onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '診断記録を編集' : '新しい診断記録を追加'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">名前 *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="山田太郎"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">生年月日 *</Label>
              <Input
                id="birthDate"
                {...form.register('birthDate')}
                placeholder="1990/01/01"
              />
              {form.formState.errors.birthDate && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.birthDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="age">年齢 *</Label>
              <Input
                id="age"
                type="number"
                {...form.register('age', { valueAsNumber: true })}
                placeholder="30"
              />
              {form.formState.errors.age && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">性別 *</Label>
              <Select onValueChange={(value) => form.setValue('gender', value as 'male' | 'female' | 'no_answer')}>
                <SelectTrigger>
                  <SelectValue placeholder="性別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="no_answer">回答しない</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.gender.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zodiac">星座 *</Label>
              <Select onValueChange={(value) => form.setValue('zodiac', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="星座を選択" />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((zodiac) => (
                    <SelectItem key={zodiac} value={zodiac}>{zodiac}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.zodiac && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.zodiac.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mbti">MBTIタイプ *</Label>
              <Select onValueChange={(value) => form.setValue('mbti', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="MBTIを選択" />
                </SelectTrigger>
                <SelectContent>
                  {mbtiTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.mbti && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.mbti.message}</p>
              )}
            </div>
          </div>

          {/* 占い結果 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="animal">動物占い（60キャラクター）*</Label>
              <Select onValueChange={(value) => {
                form.setValue('animal', value);
                // Auto-populate orientation based on selected animal character
                const orientation = getOrientationByCharacter(value);
                if (orientation) {
                  form.setValue('orientation', orientation);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="動物キャラクターを選択" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {FULL_ANIMAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.animal && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.animal.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="color">色 *</Label>
              <Select onValueChange={(value) => form.setValue('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="色を選択" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.color && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.color.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="orientation">志向（自動入力）*</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="orientation"
                  {...form.register('orientation')}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="動物選択で自動入力されます"
                />
                <span className="text-sm text-gray-500">
                  {form.watch('orientation') === 'people_oriented' && '人間指向'}
                  {form.watch('orientation') === 'castle_oriented' && '城指向'}
                  {form.watch('orientation') === 'big_vision_oriented' && '大局指向'}
                </span>
              </div>
              {form.formState.errors.orientation && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.orientation.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sixStar">6星占術 *</Label>
              <Select onValueChange={(value) => form.setValue('sixStar', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="6星占術を選択" />
                </SelectTrigger>
                <SelectContent>
                  {sixStars.map((star) => (
                    <SelectItem key={star} value={star}>{star}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.sixStar && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.sixStar.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mainTaiheki">主体癖 *</Label>
              <Input
                id="mainTaiheki"
                type="number"
                min="1"
                max="12"
                {...form.register('mainTaiheki', { valueAsNumber: true })}
                placeholder="1"
              />
              {form.formState.errors.mainTaiheki && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.mainTaiheki.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subTaiheki">副体癖</Label>
              <Input
                id="subTaiheki"
                type="number"
                min="1"
                max="12"
                {...form.register('subTaiheki', { valueAsNumber: true })}
                placeholder="2"
              />
              {form.formState.errors.subTaiheki && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.subTaiheki.message}</p>
              )}
            </div>
          </div>

          {/* 診断詳細 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">相談テーマ *</Label>
              <Input
                id="theme"
                {...form.register('theme')}
                placeholder="キャリア, 人間関係"
              />
              {form.formState.errors.theme && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.theme.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">所要時間 *</Label>
              <Input
                id="duration"
                {...form.register('duration')}
                placeholder="45分"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.duration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="satisfaction">満足度 *</Label>
              <Select onValueChange={(value) => form.setValue('satisfaction', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="満足度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
                  <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
                  <SelectItem value="3">★★★☆☆ (3)</SelectItem>
                  <SelectItem value="4">★★★★☆ (4)</SelectItem>
                  <SelectItem value="5">★★★★★ (5)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.satisfaction && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.satisfaction.message}</p>
              )}
            </div>
          </div>

          {/* テキストエリア */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="advice">提供アドバイス *</Label>
              <Textarea
                id="advice"
                {...form.register('advice')}
                placeholder="診断結果に基づくアドバイス内容"
                rows={3}
              />
              {form.formState.errors.advice && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.advice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="feedback">クライアント感想 *</Label>
              <Textarea
                id="feedback"
                {...form.register('feedback')}
                placeholder="クライアントからのフィードバック"
                rows={3}
              />
              {form.formState.errors.feedback && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.feedback.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="memo">備考</Label>
              <Textarea
                id="memo"
                {...form.register('memo')}
                placeholder="管理者用メモ"
                rows={2}
              />
            </div>
          </div>

          {/* 追加情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportUrl">レポートURL</Label>
              <Input
                id="reportUrl"
                {...form.register('reportUrl')}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="interviewScheduled">インタビュー予定日</Label>
              <Input
                id="interviewScheduled"
                type="date"
                {...form.register('interviewScheduled')}
              />
            </div>

            <div>
              <Label htmlFor="interviewDone">インタビュー実施日</Label>
              <Input
                id="interviewDone"
                type="date"
                {...form.register('interviewDone')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : isEditMode ? '更新' : '追加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}