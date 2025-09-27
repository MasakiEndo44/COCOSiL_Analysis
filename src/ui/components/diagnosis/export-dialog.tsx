'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/ui/dialog';
import { Copy, Download, FileText, Check, X } from 'lucide-react';
import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';
import { GuidanceOverlay } from '@/ui/components/overlays/guidance-overlay';

interface ExportDialogProps {
  markdownContent: string;
  isDataComplete: boolean;
  missingFields?: string[];
}

export function ExportDialog({ markdownContent, isDataComplete, missingFields = [] }: ExportDialogProps) {
  const { overlayHints, markOverlaySeen } = useDiagnosisStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Export overlay state management
  const [showExportOverlay, setShowExportOverlay] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `COCOSiL診断結果_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Show export overlay on first dialog open if not seen before
  useEffect(() => {
    if (isOpen && !hasOpenedOnce && !overlayHints.exportIntroSeen) {
      setHasOpenedOnce(true);
      setShowExportOverlay(true);
    }
  }, [isOpen, hasOpenedOnce, overlayHints.exportIntroSeen]);

  // Export overlay content and handlers
  const exportOverlayContent = {
    title: '結果出力について',
    body: '管理者やSNSなどでテキストを送信する場合は「クリップボードにコピー」を、自分用に結果を保存したい場合は「Markdownをダウンロード」をお使いください。',
    primaryAction: {
      label: '理解した',
      onClick: () => {
        setShowExportOverlay(false);
        markOverlaySeen('export');
      },
      variant: 'primary' as const,
      'data-testid': 'export-overlay-understand-action'
    }
  };

  const handleExportOverlayClose = () => {
    setShowExportOverlay(false);
    markOverlaySeen('export');
  };

  const getCopyButtonContent = () => {
    switch (copyStatus) {
      case 'success':
        return (
          <>
            <Check className="w-4 h-4 mr-2" />
            コピー完了
          </>
        );
      case 'error':
        return (
          <>
            <X className="w-4 h-4 mr-2" />
            コピー失敗
          </>
        );
      default:
        return (
          <>
            <Copy className="w-4 h-4 mr-2" />
            クリップボードにコピー
          </>
        );
    }
  };

  return (
    <>
      {/* Export Guidance Overlay */}
      <GuidanceOverlay
        open={showExportOverlay}
        onClose={handleExportOverlayClose}
        title={exportOverlayContent.title}
        body={exportOverlayContent.body}
        primaryAction={exportOverlayContent.primaryAction}
        tone="instruction"
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-8"
        disabled={!isDataComplete}
      >
        <FileText className="w-4 h-4 mr-2" />
        診断結果を出力
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>診断結果プレビュー</span>
          </DialogTitle>
          <DialogDescription>
            {isDataComplete ? (
              "統合診断結果をMarkdown形式でプレビューできます。管理者への送信やレポート作成にご利用ください。"
            ) : (
              <span className="text-amber-600">
                一部の診断が未完了です（{missingFields.join('、')}）。完全な結果を表示するには、すべての診断を完了してください。
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex justify-between items-center py-3 border-b flex-shrink-0">
          <div className="flex space-x-2">
            <Button
              onClick={handleCopyToClipboard}
              variant="secondary"
              size="sm"
              className={`transition-colors ${
                copyStatus === 'success' ? 'bg-green-50 border-green-300 text-green-700' :
                copyStatus === 'error' ? 'bg-red-50 border-red-300 text-red-700' : ''
              }`}
            >
              {getCopyButtonContent()}
            </Button>

            <Button
              onClick={handleDownloadMarkdown}
              variant="secondary"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Markdownファイルをダウンロード
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {markdownContent.length.toLocaleString()}文字
          </div>
        </div>

        {/* Markdown Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // カスタマイズされたMarkdown要素
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6 flex items-center">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-4 space-y-1">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 leading-relaxed">
                    {children}
                  </li>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-600">
                    {children}
                  </em>
                ),
                hr: () => (
                  <hr className="border-t-2 border-gray-200 my-6" />
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-300 pl-4 py-2 bg-blue-50 rounded-r-lg my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            生成日時: {new Date().toLocaleString('ja-JP')}
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="secondary"
            size="sm"
          >
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}