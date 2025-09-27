'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';
import { Copy, Download, FileText, Check, X } from 'lucide-react';
import { useMarkdownExport } from '@/hooks/use-markdown-export';

interface AdminMarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
  recordName?: string;
  recordId?: number;
}

/**
 * 管理者用診断結果Markdownモーダル
 * ExportDialogと同等の機能を提供（表示・コピー・ダウンロード）
 */
export function AdminMarkdownModal({
  isOpen,
  onClose,
  markdownContent,
  recordName = '診断結果',
  recordId
}: AdminMarkdownModalProps) {
  const filename = recordId
    ? `診断結果_${recordName}_ID${recordId}`
    : `診断結果_${recordName}`;

  const { copyStatus, copyToClipboard, downloadMarkdown, isOperationInProgress } = useMarkdownExport({
    markdownContent,
    filenameBase: filename
  });

  if (!markdownContent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              診断結果Markdown
            </DialogTitle>
            <DialogDescription>
              この診断記録にはMarkdownコンテンツが保存されていません。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="secondary">
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            診断結果Markdown - {recordName}
          </DialogTitle>
          <DialogDescription>
            診断結果をMarkdown形式でプレビューできます。管理者分析やレポート作成にご利用ください。
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-3 py-4 border-b">
          <Button
            onClick={copyToClipboard}
            disabled={isOperationInProgress}
            className="flex items-center gap-2"
          >
            {copyStatus === 'success' ? (
              <>
                <Check className="h-4 w-4" />
                コピー完了
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                クリップボードにコピー
              </>
            )}
          </Button>

          <Button
            onClick={downloadMarkdown}
            disabled={isOperationInProgress}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Markdownファイルをダウンロード
          </Button>

          <div className="ml-auto text-sm text-gray-500">
            {markdownContent.length.toLocaleString()}文字
          </div>
        </div>

        {/* Markdown Preview */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto bg-gray-50 border rounded-lg p-6">
            <div className="prose prose-gray max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h1:text-2xl prose-h1:border-b prose-h1:pb-2
              prose-h2:text-xl prose-h2:mt-6
              prose-h3:text-lg prose-h3:mt-4
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:space-y-1 prose-li:text-gray-700
              prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
              prose-pre:bg-gray-100 prose-pre:border
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdownContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 text-xs text-gray-500">
          <span>管理者専用ビューア</span>
          <Button onClick={onClose} variant="secondary" size="sm">
            <X className="h-4 w-4 mr-1" />
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}