'use client';

import { useEffect, useState } from 'react';

interface PageInfo {
  route: string;
  component: string;
  file: string;
  timestamp: Date;
}

export function useDevInspector() {
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageInfo | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // ページ情報を更新
    const updatePageInfo = () => {
      const path = window.location.pathname;
      const component = getComponentNameFromPath(path);
      const file = getFilePathFromPath(path);
      
      setCurrentPage({
        route: path,
        component,
        file,
        timestamp: new Date(),
      });
    };

    // 初期設定
    updatePageInfo();

    // ルート変更の監視
    const handleRouteChange = () => {
      updatePageInfo();
    };

    // キーボードショートカットの設定
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Alt + D でインスペクターモード切り替え
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === 'd') {
        e.preventDefault();
        setIsInspectorMode(!isInspectorMode);
        console.log(`🔍 Dev Inspector: ${!isInspectorMode ? 'ON' : 'OFF'}`);
        
        if (!isInspectorMode) {
          showPageMap();
        }
      }
      
      // Cmd/Ctrl + Alt + I でページ情報表示
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === 'i') {
        e.preventDefault();
        showPageInfo();
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInspectorMode]);

  const showPageInfo = () => {
    if (!currentPage) return;

    console.group('🏷️ COCOSiL Page Information');
    console.log('📄 Route:', currentPage.route);
    console.log('🧩 Component:', currentPage.component);
    console.log('📁 File Path:', currentPage.file);
    console.log('🕐 Loaded:', currentPage.timestamp.toLocaleTimeString());
    console.log('🔗 Full URL:', window.location.href);
    console.groupEnd();
  };

  const showPageMap = () => {
    console.group('🗺️ COCOSiL Page Map');
    
    const pages = [
      { route: '/', name: 'ランディング', file: 'src/app/page.tsx', description: 'システム概要・診断開始' },
      { route: '/diagnosis', name: '診断開始', file: 'src/app/diagnosis/page.tsx', description: '基本情報入力' },
      { route: '/diagnosis/mbti', name: 'MBTI診断', file: 'src/app/diagnosis/mbti/page.tsx', description: 'MBTI性格診断' },
      { route: '/diagnosis/taiheki', name: '体癖診断', file: 'src/app/diagnosis/taiheki/page.tsx', description: '野口整体 体癖診断' },
      { route: '/diagnosis/results', name: '診断結果', file: 'src/app/diagnosis/results/page.tsx', description: '統合診断結果表示' },
      { route: '/diagnosis/chat', name: 'AI相談', file: 'src/app/diagnosis/chat/page.tsx', description: 'Claude AI相談チャット' },
      { route: '/admin', name: '管理者', file: 'src/app/admin/page.tsx', description: '管理者ダッシュボード' },
    ];

    pages.forEach(page => {
      const isCurrent = page.route === currentPage?.route;
      console.log(
        `${isCurrent ? '👉' : '  '} ${page.route.padEnd(20)} | ${page.name.padEnd(12)} | ${page.description}`
      );
    });
    
    console.log('\n📋 操作方法:');
    console.log('  Cmd/Ctrl + Alt + D : インスペクターモード切り替え');
    console.log('  Cmd/Ctrl + Alt + I : 現在ページ情報表示');
    console.log('  🏷️ ラベルクリック    : 個別要素情報表示');
    
    console.groupEnd();
  };

  const getComponentNameFromPath = (path: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'HomePage',
      '/diagnosis': 'DiagnosisPage',
      '/diagnosis/mbti': 'MBTIPage',
      '/diagnosis/taiheki': 'TaihekiPage',
      '/diagnosis/results': 'ResultsPage',
      '/diagnosis/chat': 'ChatPage',
      '/admin': 'AdminPage',
    };
    
    return pathMap[path] || 'UnknownPage';
  };

  const getFilePathFromPath = (path: string): string => {
    const fileMap: Record<string, string> = {
      '/': 'src/app/page.tsx',
      '/diagnosis': 'src/app/diagnosis/page.tsx',
      '/diagnosis/mbti': 'src/app/diagnosis/mbti/page.tsx',
      '/diagnosis/taiheki': 'src/app/diagnosis/taiheki/page.tsx',
      '/diagnosis/results': 'src/app/diagnosis/results/page.tsx',
      '/diagnosis/chat': 'src/app/diagnosis/chat/page.tsx',
      '/admin': 'src/app/admin/page.tsx',
    };
    
    return fileMap[path] || 'src/app/[unknown]/page.tsx';
  };

  return {
    isInspectorMode,
    currentPage,
    showPageInfo,
    showPageMap,
    toggleInspector: () => setIsInspectorMode(!isInspectorMode),
  };
}