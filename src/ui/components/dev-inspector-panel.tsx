'use client';

import { useDevInspector } from '@/hooks/use-dev-inspector';
import { useEffect } from 'react';

export function DevInspectorPanel() {
  const { isInspectorMode, currentPage } = useDevInspector();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // スタイルを動的に追加
    const style = document.createElement('style');
    style.textContent = `
      .dev-tagger:hover {
        outline: 2px dashed #facc15;
        outline-offset: 2px;
      }
      .dev-tagger button {
        transition: all 0.2s ease;
      }
      .dev-tagger:hover button {
        transform: scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isInspectorMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white text-xs font-mono p-2 rounded shadow-lg backdrop-blur">
      <div className="space-y-1">
        <div>🏷️ <strong>Inspector Mode: ON</strong></div>
        <div>📄 Route: {currentPage?.route}</div>
        <div>🧩 Component: {currentPage?.component}</div>
        <div className="text-yellow-300">
          Cmd/Ctrl + Alt + D: Toggle Inspector
        </div>
        <div className="text-yellow-300">
          Cmd/Ctrl + Alt + I: Show Page Info
        </div>
      </div>
    </div>
  );
}