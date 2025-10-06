'use client';

import { ReactNode } from 'react';
import { User } from 'lucide-react';

interface PersonalizedHighlightCardProps {
  primaryType: number;
  secondaryType?: number;
  title?: string;
  children: ReactNode;
}

/**
 * パーソナライズドハイライトカード
 *
 * 診断結果（主体癖・副体癖）に基づいた個別化コンテンツを表示するカードコンポーネント。
 * 各学習章で「あなた（N種）の場合」として使用。
 *
 * @example
 * ```tsx
 * <PersonalizedHighlightCard primaryType={3} secondaryType={7}>
 *   3種の方は、感情的で行動的な特徴があります...
 * </PersonalizedHighlightCard>
 * ```
 */
export function PersonalizedHighlightCard({
  primaryType,
  secondaryType,
  title,
  children,
}: PersonalizedHighlightCardProps) {
  const typeDisplay = secondaryType && secondaryType > 0
    ? `${primaryType}種 + ${secondaryType}種`
    : `${primaryType}種`;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-5 my-6 shadow-sm">
      <div className="flex items-start space-x-3">
        {/* アイコン */}
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-5 h-5 text-green-600" />
        </div>

        {/* コンテンツ */}
        <div className="flex-1">
          {/* タイトル */}
          <h4 className="font-bold text-green-900 text-lg mb-2 flex items-center">
            📌 {title || `あなた（${typeDisplay}）の場合`}
          </h4>

          {/* 本文 */}
          <div className="text-sm text-green-800 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
