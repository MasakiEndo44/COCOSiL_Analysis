/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useMarkdownExport } from '@/hooks/use-markdown-export'

// Mock clipboard API
const mockWriteText = jest.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText
  }
})

// Mock URL.createObjectURL and document methods
global.URL = {
  createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: jest.fn()
} as any

const mockClick = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()

// Mock document.createElement
const mockAnchorElement = {
  href: '',
  download: '',
  click: mockClick
}

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue(mockAnchorElement)
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
})

describe('useMarkdownExport', () => {
  const testMarkdownContent = '# テスト診断結果\n\n## 基本情報\n- 名前: テスト太郎\n\n## MBTI\n- タイプ: INTJ'
  const testFilenameBase = 'テスト診断結果'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useMarkdownExport({
        markdownContent: testMarkdownContent,
        filenameBase: testFilenameBase
      })
    )

    expect(result.current.copyStatus).toBe('idle')
    expect(result.current.isOperationInProgress).toBe(false)
    expect(typeof result.current.copyToClipboard).toBe('function')
    expect(typeof result.current.downloadMarkdown).toBe('function')
  })

  describe('copyToClipboard', () => {
    test('should copy markdown content to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.copyToClipboard()
      })

      expect(mockWriteText).toHaveBeenCalledWith(testMarkdownContent)
      expect(result.current.copyStatus).toBe('success')
      expect(result.current.isOperationInProgress).toBe(false)
    })

    test('should handle clipboard write errors gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard access denied'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.copyToClipboard()
      })

      expect(result.current.copyStatus).toBe('error')
      expect(consoleSpy).toHaveBeenCalledWith('クリップボードへのコピーに失敗しました:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    test('should set operation in progress during clipboard operation', async () => {
      let resolveCopy: (value?: any) => void
      const copyPromise = new Promise(resolve => {
        resolveCopy = resolve
      })
      mockWriteText.mockReturnValue(copyPromise)

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      act(() => {
        result.current.copyToClipboard()
      })

      expect(result.current.isOperationInProgress).toBe(true)

      await act(async () => {
        resolveCopy()
        await copyPromise
      })

      expect(result.current.isOperationInProgress).toBe(false)
    })

    test('should reset copy status after timeout', async () => {
      mockWriteText.mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.copyToClipboard()
      })

      expect(result.current.copyStatus).toBe('success')

      act(() => {
        jest.advanceTimersByTime(2000) // Advance by 2 seconds
      })

      expect(result.current.copyStatus).toBe('idle')
    })
  })

  describe('downloadMarkdown', () => {
    test('should download markdown file successfully', async () => {
      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.downloadMarkdown()
      })

      // Verify blob creation
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.any(Blob)
      )

      // Verify anchor element setup
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockAnchorElement.href).toBe('blob:mock-url')
      expect(mockAnchorElement.download).toBe(`${testFilenameBase}.md`)

      // Verify DOM manipulation
      expect(mockAppendChild).toHaveBeenCalledWith(mockAnchorElement)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockAnchorElement)

      // Verify cleanup
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    test('should handle download errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      global.URL.createObjectURL = jest.fn().mockImplementation(() => {
        throw new Error('Blob creation failed')
      })

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.downloadMarkdown()
      })

      expect(consoleSpy).toHaveBeenCalledWith('ファイルダウンロードに失敗しました:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    test('should create correct blob with UTF-8 encoding', async () => {
      const mockBlob = jest.fn().mockImplementation((content, options) => {
        return new Blob(content, options)
      })
      global.Blob = mockBlob

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.downloadMarkdown()
      })

      expect(mockBlob).toHaveBeenCalledWith(
        [testMarkdownContent],
        { type: 'text/markdown;charset=utf-8' }
      )
    })

    test('should set operation in progress during download', async () => {
      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      // Mock slow operation
      const originalCreateObjectURL = global.URL.createObjectURL
      global.URL.createObjectURL = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve('blob:mock-url'), 100))
      })

      act(() => {
        result.current.downloadMarkdown()
      })

      expect(result.current.isOperationInProgress).toBe(true)

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      global.URL.createObjectURL = originalCreateObjectURL
    })
  })

  describe('edge cases', () => {
    test('should handle empty markdown content', async () => {
      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: '',
          filenameBase: testFilenameBase
        })
      )

      await act(async () => {
        await result.current.copyToClipboard()
      })

      expect(mockWriteText).toHaveBeenCalledWith('')
    })

    test('should handle special characters in filename', async () => {
      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: 'テスト/診断結果:特殊文字'
        })
      )

      await act(async () => {
        await result.current.downloadMarkdown()
      })

      expect(mockAnchorElement.download).toBe('テスト/診断結果:特殊文字.md')
    })

    test('should use default filename when not provided', () => {
      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent
        })
      )

      expect(result.current).toBeDefined()
      // The hook should still function with default filename
    })
  })

  describe('concurrent operations', () => {
    test('should prevent concurrent copy operations', async () => {
      mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      // Start first copy operation
      act(() => {
        result.current.copyToClipboard()
      })

      expect(result.current.isOperationInProgress).toBe(true)

      // Try to start second copy operation
      await act(async () => {
        await result.current.copyToClipboard()
      })

      // Should not have called writeText twice
      expect(mockWriteText).toHaveBeenCalledTimes(1)
    })

    test('should prevent download while copy is in progress', async () => {
      mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const { result } = renderHook(() =>
        useMarkdownExport({
          markdownContent: testMarkdownContent,
          filenameBase: testFilenameBase
        })
      )

      // Start copy operation
      act(() => {
        result.current.copyToClipboard()
      })

      expect(result.current.isOperationInProgress).toBe(true)

      // Try to download
      await act(async () => {
        await result.current.downloadMarkdown()
      })

      // Download should not have started
      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
    })
  })
})