'use client';

import { useState } from 'react';

type CopyStatus = 'idle' | 'success' | 'error';

interface UseMarkdownExportProps {
  markdownContent: string;
  filenameBase?: string;
}

interface UseMarkdownExportReturn {
  copyStatus: CopyStatus;
  copyToClipboard: () => Promise<void>;
  downloadMarkdown: () => void;
  isOperationInProgress: boolean;
}

/**
 * Markdownコンテンツのコピー・ダウンロード機能を提供する共有フック
 * ExportDialogとAdminMarkdownModalで共通利用
 */
export function useMarkdownExport({
  markdownContent,
  filenameBase = '診断結果'
}: UseMarkdownExportProps): UseMarkdownExportReturn {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  const copyToClipboard = async () => {
    if (isOperationInProgress) return;

    setIsOperationInProgress(true);
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const downloadMarkdown = () => {
    if (isOperationInProgress) return;

    setIsOperationInProgress(true);
    try {
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${filenameBase}_${timestamp}.md`;

      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download markdown:', error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  return {
    copyStatus,
    copyToClipboard,
    downloadMarkdown,
    isOperationInProgress
  };
}