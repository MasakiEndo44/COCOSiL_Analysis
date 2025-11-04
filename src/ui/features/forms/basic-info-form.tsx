'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { ErrorDisplay } from '@/ui/components/ui/error-display';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { basicInfoSchema, type BasicInfoFormData } from '@/lib/validations';
import { FortuneResult } from '@/types';
import { isValidDate } from '@/lib/utils';

const CURRENT_YEAR = new Date().getFullYear();
const years = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => ({
  value: (CURRENT_YEAR - i).toString(),
  label: (CURRENT_YEAR - i).toString()
}));

const months = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}月`
}));

const days = Array.from({ length: 31 }, (_, i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString()
}));

const genderOptions = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'no_answer', label: '回答しない' }
];

interface BasicInfoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function BasicInfoForm({ onSuccess, onError }: BasicInfoFormProps) {
  const { setBasicInfo, setLoading, setError, basicInfo, error, isLoading, authMode } = useDiagnosisStore();
  const [lastSubmitData, setLastSubmitData] = React.useState<BasicInfoFormData | null>(null);

  // Phase 1: Clerk user data for auto-fill
  const { user, isLoaded: isUserLoaded } = useUser();

  // Determine default values with Clerk auto-fill for authenticated users
  const getDefaultValues = (): Partial<BasicInfoFormData> => {
    // If there's existing data in store, use it (user is resuming)
    if (basicInfo) {
      return {
        name: basicInfo.name,
        email: basicInfo.email,
        gender: basicInfo.gender,
        birthdate: {
          year: basicInfo.birthdate.year,
          month: basicInfo.birthdate.month,
          day: basicInfo.birthdate.day
        },
        privacyConsent: false
      };
    }

    // If authenticated with Clerk and user data is loaded, auto-fill
    if (authMode === 'authenticated' && isUserLoaded && user) {
      const fullName = user.fullName ||
                      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                      '';
      const email = user.primaryEmailAddress?.emailAddress || '';

      return {
        name: fullName,
        email: email,
        gender: 'no_answer',
        privacyConsent: false
      };
    }

    // Anonymous user - empty form
    return {
      gender: 'no_answer',
      privacyConsent: false
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    setError: setFormError
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: getDefaultValues()
  });

  // 選択された年月に基づいて日数を動的に調整
  const selectedYear = watch('birthdate.year');
  const selectedMonth = watch('birthdate.month');

  const getDaysInMonth = (year: number, month: number) => {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
  };

  const availableDays = React.useMemo(() => {
    if (selectedYear && selectedMonth) {
      const maxDay = getDaysInMonth(selectedYear, selectedMonth);
      return Array.from({ length: maxDay }, (_, i) => ({
        value: (i + 1).toString(),
        label: (i + 1).toString()
      }));
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // エラー時の再試行関数
  const handleRetry = async () => {
    if (lastSubmitData) {
      await onSubmit(lastSubmitData);
    }
  };

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setLoading(true);
      setError(null);
      setLastSubmitData(data); // 再試行用にデータを保存

      // 日付の妥当性を再チェック
      const { year, month, day } = data.birthdate;
      if (!isValidDate(year, month, day)) {
        setFormError('birthdate', {
          type: 'manual',
          message: '存在しない日付です'
        });
        return;
      }

      // 未来の日付チェック
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      if (birthDate > today) {
        setFormError('birthdate', {
          type: 'manual',
          message: '未来の日付は入力できません'
        });
        return;
      }

      // 150歳以上のチェック
      const age = today.getFullYear() - birthDate.getFullYear() - 
        (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
      if (age > 150) {
        setFormError('birthdate', {
          type: 'manual',
          message: '年齢が150歳を超えています。正しい日付を入力してください'
        });
        return;
      }

      // 18歳未満チェック（警告のみ）
      if (age < 18) {
        console.warn('18歳未満のユーザーです');
      }

      // 算命学・動物占い計算API呼び出し（リトライ機能付き）
      let fortuneData;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const fortuneResponse = await fetch('/api/fortune-calc-v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              year: data.birthdate.year,
              month: data.birthdate.month,
              day: data.birthdate.day,
            }),
          });

          if (!fortuneResponse.ok) {
            const errorText = await fortuneResponse.text();
            throw new Error(`APIエラー: ${fortuneResponse.status} - ${errorText}`);
          }

          const fortuneApiResponse = await fortuneResponse.json();
          if (!fortuneApiResponse.success) {
            throw new Error(`算命学API計算エラー: ${fortuneApiResponse.error || '不明なエラー'}`);
          }
          fortuneData = fortuneApiResponse.data;
          break; // 成功したらループを抜ける
        } catch (apiError) {
          retryCount++;
          console.warn(`算命学API呼び出し失敗 (${retryCount}/${maxRetries}):`, apiError);
          
          if (retryCount >= maxRetries) {
            throw new Error(`算命学計算に失敗しました。${maxRetries}回試行しましたが、サーバーエラーのため処理できませんでした。`);
          }
          
          // 次のリトライまで少し待つ
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // Zustandストアに保存
      setBasicInfo({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        gender: data.gender,
        birthdate: data.birthdate
      });

      // 算命学結果も同時に保存
      const { setFortune } = useDiagnosisStore.getState();
      const fortuneResult: FortuneResult = {
        zodiac: fortuneData.zodiac, // v2 API uses zodiac
        animal: fortuneData.animal, // v2 API uses animal
        sixStar: fortuneData.six_star,
        element: fortuneData.fortune_detail?.personality_traits?.[1]?.replace('カラー：', '') || '不明', // Extract color from personality traits
        fortune: `${fortuneData.animal}の特徴を持つ方です`,
        characteristics: [fortuneData.animal?.split('な')?.[0] || fortuneData.animal?.split('の')?.[0] || '特別'] // Safe split with fallback
      };
      // Store enhanced data for display (extract from fortune_detail)
      (fortuneResult as any).animalDetails = {
        character: fortuneData.animal,
        color: fortuneData.fortune_detail?.personality_traits?.[1]?.replace('カラー：', '') || '不明'
      };
      
      setFortune(fortuneResult);

      onSuccess?.();
    } catch (error) {
      console.error('基本情報フォームエラー:', error);
      
      let errorMessage = '基本情報の保存に失敗しました';
      let errorCode = 'BASIC_INFO_SAVE_FAILED';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // エラータイプに応じたコードとメッセージの設定
        if (error.message.includes('APIエラー')) {
          errorCode = 'FORTUNE_API_ERROR';
        } else if (error.message.includes('ネトワーク')) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'ネトワークエラーが発生しました。インターネット接続を確認してからもう一度お試しください。';
        } else if (error.message.includes('タイムアウト')) {
          errorCode = 'TIMEOUT_ERROR';
          errorMessage = '処理がタイムアウトしました。しばらく待ってからもう一度お試しください。';
        }
      }
      
      setError({
        code: errorCode,
        message: errorMessage,
        timestamp: new Date(),
        retryable: errorCode !== 'BASIC_INFO_SAVE_FAILED'
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-modal p-8 shadow-z2">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">1</span>
        </div>
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-2">
          基本情報入力
        </h2>
        <p className="text-body-m-mobile md:text-body-m-desktop text-light-fg-muted">
          診断に必要な基本情報を入力してください
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={error.retryable ? handleRetry : undefined}
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 名前 */}
        <Input
          label="お名前（ニックネーム可）"
          placeholder="例：田中太郎"
          {...register('name')}
          error={errors.name?.message}
          required
        />

        {/* メールアドレス */}
        <Input
          type="email"
          label="メールアドレス"
          placeholder="例：taro@example.com"
          {...register('email')}
          error={errors.email?.message}
          helperText="診断結果の通知に使用します"
          required
        />

        {/* 性別 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-light-fg">
            性別 <span className="text-error ml-1">*</span>
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ''} onValueChange={field.onChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="性別を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-error">{errors.gender.message}</p>
          )}
        </div>

        {/* 生年月日 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-light-fg">
            生年月日 <span className="text-error ml-1">*</span>
          </label>
          <p className="text-xs text-light-fg-muted mb-2">
            算命学計算に必要なため、正確な生年月日を入力してください
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Controller
              name="birthdate.year"
              control={control}
              render={({ field }) => (
                <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="年" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="birthdate.month"
              control={control}
              render={({ field }) => (
                <Select value={field.value?.toString() || ''} onValueChange={(value) => field.onChange(parseInt(value))}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="月" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="birthdate.day"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ''}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="日" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDays.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {(errors.birthdate?.year || errors.birthdate?.month || errors.birthdate?.day || errors.birthdate?.message) && (
            <div className="text-sm text-error space-y-1">
              {errors.birthdate?.year && <p>{errors.birthdate.year.message}</p>}
              {errors.birthdate?.month && <p>{errors.birthdate.month.message}</p>}
              {errors.birthdate?.day && <p>{errors.birthdate.day.message}</p>}
              {errors.birthdate?.message && <p>{errors.birthdate.message}</p>}
            </div>
          )}
          {selectedYear && selectedMonth && (
            <p className="text-xs text-light-fg-muted">
              {selectedYear}年{selectedMonth}月は{getDaysInMonth(selectedYear, selectedMonth)}日まであります
            </p>
          )}
        </div>

        {/* プライバシーポリシー同意 */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacyConsent"
              {...register('privacyConsent')}
              className="mt-1 w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2"
            />
            <label htmlFor="privacyConsent" className="text-sm text-light-fg">
              <span className="font-medium">プライバシーポリシーに同意する</span>
              <span className="text-error ml-1">*</span>
              <p className="text-xs text-light-fg-muted mt-1">
                入力いただいた情報は診断目的のみに使用し、第三者への提供は行いません。
                詳しくは<a href="/privacy" className="text-brand-600 underline hover:text-brand-700">プライバシーポリシー</a>をご確認ください。
              </p>
            </label>
          </div>
          {errors.privacyConsent && (
            <p className="text-sm text-error">{errors.privacyConsent.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {isLoading ? '算命学計算中...' : '次へ進む'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-light-fg-muted">
            入力いただいた情報は診断目的のみに使用し、<br />
            30日後に自動削除されます
          </p>
        </div>
      </form>
    </div>
  );
}