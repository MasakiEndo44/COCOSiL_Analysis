'use client';

import React from 'react';
import clsx from 'clsx';

interface DevTagProps {
  label: string;          // ページ名、コンポーネント名、またはカスタムラベル
  note?: string;          // 追加情報（例: "データフェッチ", "フォーム処理"など）
  position?: 'tl' | 'tr' | 'bl' | 'br'; // 表示位置（top-left, top-right, bottom-left, bottom-right）
  children: React.ReactNode;
  onClick?: () => void;   // クリック時のアクション
  highlight?: boolean;    // ハイライト表示
}

// 開発環境でのみ表示するかを判定
const isDevelopment = process.env.NODE_ENV === 'development';
const isTagsEnabled = process.env.NEXT_PUBLIC_SHOW_DEV_TAGS === 'true' || isDevelopment;

export function DevTag({ 
  label, 
  note, 
  position = 'tl', 
  children, 
  onClick,
  highlight = false 
}: DevTagProps) {
  // 本番環境またはタグが無効の場合は子要素のみ表示
  if (!isTagsEnabled) return <>{children}</>;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // デフォルトアクション: コンソールにページ情報を出力
      console.log(`🏷️ Page/Component: ${label}${note ? ` | Note: ${note}` : ''}`);
    }
  };

  return (
    <div className="relative dev-tagger group">
      {children}
      <button
        className={clsx(
          'absolute z-50 px-2 py-1 text-xs font-mono border rounded shadow-sm transition-all duration-200',
          'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400',
          {
            'top-0 left-0': position === 'tl',
            'top-0 right-0': position === 'tr',
            'bottom-0 left-0': position === 'bl',
            'bottom-0 right-0': position === 'br',
          },
          highlight 
            ? 'bg-red-200 text-red-900 border-red-300 animate-pulse'
            : 'bg-yellow-200 text-yellow-900 border-yellow-300 opacity-80 hover:opacity-100'
        )}
        onClick={handleClick}
        data-dev-tag={label}
        title={`Click for details: ${label}${note ? ` • ${note}` : ''}`}
      >
        🏷️ {label}
        {note && (
          <span className="text-xs opacity-70 ml-1">• {note}</span>
        )}
      </button>
    </div>
  );
}

// 特定ページ用のヘルパーコンポーネント
export function PageTag({ 
  route, 
  description, 
  children 
}: { 
  route: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <DevTag 
      label={route} 
      note={description} 
      position="tr"
      onClick={() => {
        console.log(`📄 Page: ${route}${description ? ` | ${description}` : ''}`);
        console.log(`🔗 URL: ${window.location.href}`);
      }}
    >
      {children}
    </DevTag>
  );
}

// コンポーネント用のヘルパー
export function ComponentTag({ 
  name, 
  type, 
  children 
}: { 
  name: string; 
  type?: 'form' | 'ui' | 'feature' | 'layout';
  children: React.ReactNode;
}) {
  return (
    <DevTag 
      label={`<${name}>`}
      note={type}
      position="bl"
      onClick={() => {
        console.log(`🧩 Component: ${name}${type ? ` (${type})` : ''}`);
      }}
    >
      {children}
    </DevTag>
  );
}

// セクション用のヘルパー
export function SectionTag({ 
  name, 
  functionality, 
  children 
}: { 
  name: string; 
  functionality?: string;
  children: React.ReactNode;
}) {
  return (
    <DevTag 
      label={name}
      note={functionality}
      position="tl"
    >
      {children}
    </DevTag>
  );
}