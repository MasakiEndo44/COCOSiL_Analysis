'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface LoadMoreButtonProps {
  cursor: number;
}

/**
 * LoadMoreButton - Client Component
 *
 * Handles pagination by updating URL searchParams with next cursor
 * Uses React startTransition for smooth UI updates
 *
 * Pattern:
 * - Clicking updates URL with cursor parameter
 * - Server component re-fetches with new cursor
 * - React Streaming shows loading state during transition
 */
export function LoadMoreButton({ cursor }: LoadMoreButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);

    startTransition(() => {
      // Update URL with cursor parameter
      const params = new URLSearchParams(window.location.search);
      params.set('cursor', cursor.toString());

      router.push(`?${params.toString()}`, { scroll: false });

      // Reset loading state after navigation
      setTimeout(() => setIsLoading(false), 500);
    });
  };

  return (
    <button
      onClick={handleLoadMore}
      disabled={isLoading || isPending}
      className="px-6 py-3 bg-white text-brand-700 font-medium rounded-lg border-2 border-brand-300 hover:bg-brand-50 hover:border-brand-400 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading || isPending ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>読み込み中...</span>
        </>
      ) : (
        <>
          <span>さらに表示</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </>
      )}
    </button>
  );
}
