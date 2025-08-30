'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Select } from '@/ui/components/ui/select';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { basicInfoSchema, type BasicInfoFormData } from '@/lib/validations';
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
  const { setBasicInfo, setLoading, setError, basicInfo } = useDiagnosisStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: basicInfo ? {
      name: basicInfo.name,
      email: basicInfo.email,
      gender: basicInfo.gender,
      birthdate: {
        year: basicInfo.birthdate.year,
        month: basicInfo.birthdate.month,
        day: basicInfo.birthdate.day
      }
    } : {
      gender: 'no_answer'
    }
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

  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setLoading(true);
      setError(null);

      // 日付の妥当性を再チェック
      const { year, month, day } = data.birthdate;
      if (!isValidDate(year, month, day)) {
        setFormError('birthdate', {
          type: 'manual',
          message: '存在しない日付です'
        });
        return;
      }

      // 18歳未満チェック（要件で特になしとされたが、念のため警告）
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      const age = today.getFullYear() - birthDate.getFullYear();
      const isMinor = age < 18 || (age === 18 && today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()));

      if (isMinor) {
        console.warn('18歳未満のユーザーです');
      }

      // Zustandストアに保存
      setBasicInfo({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        gender: data.gender,
        birthdate: data.birthdate
      });

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '基本情報の保存に失敗しました';
      setError({
        code: 'BASIC_INFO_SAVE_FAILED',
        message: errorMessage,
        timestamp: new Date()
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
        <Select
          label="性別"
          options={genderOptions}
          placeholder="性別を選択してください"
          {...register('gender')}
          error={errors.gender?.message}
          required
        />

        {/* 生年月日 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-light-fg">
            生年月日 <span className="text-error ml-1">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Select
              options={years}
              placeholder="年"
              {...register('birthdate.year', { valueAsNumber: true })}
              error={errors.birthdate?.year?.message}
              required
            />
            <Select
              options={months}
              placeholder="月"
              {...register('birthdate.month', { valueAsNumber: true })}
              error={errors.birthdate?.month?.message}
              required
            />
            <Select
              options={availableDays}
              placeholder="日"
              {...register('birthdate.day', { valueAsNumber: true })}
              error={errors.birthdate?.day?.message}
              required
            />
          </div>
          {errors.birthdate?.message && (
            <p className="text-sm text-error">{errors.birthdate.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            次へ進む
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