import { useState, useEffect } from 'react';

/**
 * Media Query Hook
 *
 * レスポンシブデザインのためのメディアクエリhook。
 * SSR対応で、クライアントサイドのみで動作する。
 *
 * @param query - メディアクエリ文字列（例: '(max-width: 768px)'）
 * @returns マッチ状態（true/false）
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // SSR時はfalse（サーバーサイドではmatch判定不可）
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // クライアントサイドのみで実行
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // 初期値設定
    setMatches(mediaQuery.matches);

    // リスナー登録（ウィンドウリサイズ時に再評価）
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Safari 13以前の互換性対応
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // @ts-ignore - Deprecated but needed for old browsers
      mediaQuery.addListener(handler);
    }

    // クリーンアップ
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // @ts-ignore - Deprecated but needed for old browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Preset hooks for common breakpoints
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
