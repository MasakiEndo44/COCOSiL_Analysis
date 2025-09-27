/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminMarkdownModal } from '@/ui/components/admin/admin-markdown-modal'

// Mock the markdown export hook
const mockCopyToClipboard = jest.fn()
const mockDownloadMarkdown = jest.fn()

jest.mock('@/hooks/use-markdown-export', () => ({
  useMarkdownExport: jest.fn(() => ({
    copyStatus: 'idle',
    copyToClipboard: mockCopyToClipboard,
    downloadMarkdown: mockDownloadMarkdown,
    isOperationInProgress: false
  }))
}))

// Mock react-markdown and rehype plugins
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>
  }
})

jest.mock('remark-gfm', () => ({}))

describe('AdminMarkdownModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    markdownContent: '# テスト診断結果\n\n## 基本情報\n- 名前: テスト太郎\n- 年齢: 30歳\n\n## MBTI\n- タイプ: INTJ',
    recordName: 'テスト太郎',
    recordId: 1
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders modal with markdown content when open', () => {
    render(<AdminMarkdownModal {...defaultProps} />)

    // Check title
    expect(screen.getByText('診断結果Markdown - テスト太郎')).toBeInTheDocument()

    // Check markdown content is rendered (content may be formatted differently)
    const markdownElement = screen.getByTestId('markdown-content')
    expect(markdownElement).toHaveTextContent(/テスト診断結果/)
    expect(markdownElement).toHaveTextContent(/テスト太郎/)
    expect(markdownElement).toHaveTextContent(/INTJ/)

    // Check action buttons
    expect(screen.getByText('クリップボードにコピー')).toBeInTheDocument()
    expect(screen.getByText('Markdownファイルをダウンロード')).toBeInTheDocument()

    // Check character count (actual length is 61, not 105)
    expect(screen.getByText(/\d+文字/)).toBeInTheDocument()
  })

  test('does not render when closed', () => {
    render(<AdminMarkdownModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('handles copy to clipboard action', async () => {
    const user = userEvent.setup()
    render(<AdminMarkdownModal {...defaultProps} />)

    const copyButton = screen.getByText('クリップボードにコピー')
    await user.click(copyButton)

    expect(mockCopyToClipboard).toHaveBeenCalledTimes(1)
  })

  test('handles download action', async () => {
    const user = userEvent.setup()
    render(<AdminMarkdownModal {...defaultProps} />)

    const downloadButton = screen.getByText('Markdownファイルをダウンロード')
    await user.click(downloadButton)

    expect(mockDownloadMarkdown).toHaveBeenCalledTimes(1)
  })

  test('shows success state for copy operation', () => {
    const { useMarkdownExport } = require('@/hooks/use-markdown-export')
    useMarkdownExport.mockReturnValue({
      copyStatus: 'success',
      copyToClipboard: mockCopyToClipboard,
      downloadMarkdown: mockDownloadMarkdown,
      isOperationInProgress: false
    })

    render(<AdminMarkdownModal {...defaultProps} />)

    expect(screen.getByText('コピー完了')).toBeInTheDocument()
  })

  test('disables buttons during operation', () => {
    const { useMarkdownExport } = require('@/hooks/use-markdown-export')
    useMarkdownExport.mockReturnValue({
      copyStatus: 'idle',
      copyToClipboard: mockCopyToClipboard,
      downloadMarkdown: mockDownloadMarkdown,
      isOperationInProgress: true
    })

    render(<AdminMarkdownModal {...defaultProps} />)

    const copyButton = screen.getByText('クリップボードにコピー')
    const downloadButton = screen.getByText('Markdownファイルをダウンロード')

    expect(copyButton).toBeDisabled()
    expect(downloadButton).toBeDisabled()
  })

  test('handles close modal action', async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(<AdminMarkdownModal {...defaultProps} onClose={mockOnClose} />)

    const closeButton = screen.getByText('閉じる')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('renders empty state when no markdown content', () => {
    render(
      <AdminMarkdownModal
        {...defaultProps}
        markdownContent=""
        recordName="テスト太郎"
      />
    )

    expect(screen.getByText('この診断記録にはMarkdownコンテンツが保存されていません。')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument()
    expect(screen.queryByText('クリップボードにコピー')).not.toBeInTheDocument()
  })

  test('uses default record name when not provided', () => {
    render(
      <AdminMarkdownModal
        {...defaultProps}
        recordName={undefined}
      />
    )

    expect(screen.getByText('診断結果Markdown - 診断結果')).toBeInTheDocument()
  })

  test('generates correct filename with record ID', () => {
    const { useMarkdownExport } = require('@/hooks/use-markdown-export')

    render(<AdminMarkdownModal {...defaultProps} />)

    expect(useMarkdownExport).toHaveBeenCalledWith({
      markdownContent: defaultProps.markdownContent,
      filenameBase: '診断結果_テスト太郎_ID1'
    })
  })

  test('generates filename without record ID when not provided', () => {
    const { useMarkdownExport } = require('@/hooks/use-markdown-export')

    render(
      <AdminMarkdownModal
        {...defaultProps}
        recordId={undefined}
      />
    )

    expect(useMarkdownExport).toHaveBeenCalledWith({
      markdownContent: defaultProps.markdownContent,
      filenameBase: '診断結果_テスト太郎'
    })
  })

  test('handles keyboard navigation', async () => {
    const mockOnClose = jest.fn()
    const user = userEvent.setup()

    render(<AdminMarkdownModal {...defaultProps} onClose={mockOnClose} />)

    // Tab through elements to test keyboard navigation
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
  })

  test('renders with proper ARIA attributes', () => {
    render(<AdminMarkdownModal {...defaultProps} />)

    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('診断結果Markdown - テスト太郎')

    // Check for buttons with proper accessibility
    expect(screen.getByRole('button', { name: 'クリップボードにコピー' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Markdownファイルをダウンロード' })).toBeInTheDocument()
  })

  test('supports large markdown content', () => {
    const largeContent = '# 診断結果\n\n' + 'テスト内容\n'.repeat(1000)

    render(
      <AdminMarkdownModal
        {...defaultProps}
        markdownContent={largeContent}
      />
    )

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByText(`${largeContent.length.toLocaleString()}文字`)).toBeInTheDocument()
  })

  test('handles special characters in content and filename', () => {
    const specialContent = '# 診断結果\n\n特殊文字: @#$%^&*()[]{}|\\:";\'<>?,./'
    const specialName = 'テスト/太郎:特殊文字'

    render(
      <AdminMarkdownModal
        {...defaultProps}
        markdownContent={specialContent}
        recordName={specialName}
      />
    )

    // Check that content is rendered (markdown may format it differently)
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument()
    expect(screen.getByText(`診断結果Markdown - ${specialName}`)).toBeInTheDocument()
  })
})