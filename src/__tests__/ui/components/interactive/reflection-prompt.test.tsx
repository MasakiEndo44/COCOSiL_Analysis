import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReflectionPrompt } from '@/ui/components/interactive/reflection-prompt'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockPrompts = [
  {
    id: '1',
    title: '理解度',
    category: 'understanding' as const,
    prompt: "今日学んだことについて、どの程度理解できましたか？",
    placeholder: "ここに記録してください..."
  },
  {
    id: '2',
    title: '感想',
    category: 'self-discovery' as const,
    prompt: "学習を通して感じたことを自由に書いてください。",
    placeholder: "ここに記録してください..."
  }
]

describe('ReflectionPrompt Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  it('プロンプトが正しく表示される', () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    expect(screen.getByText('振り返りと考察')).toBeInTheDocument()
    expect(screen.getByText('理解度')).toBeInTheDocument()
    expect(screen.getByText('今日学んだことについて、どの程度理解できましたか？')).toBeInTheDocument()
  })

  it('テキストエリアに入力できる', () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: 'テスト入力です' } })
    
    expect(textarea).toHaveValue('テスト入力です')
  })

  it('文字数カウントが正しく表示される', () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: 'テスト' } })
    
    expect(screen.getByText('3 文字')).toBeInTheDocument()
  })

  it('プロンプトを切り替えできる', async () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    // 2番目のプロンプトに切り替え
    fireEvent.click(screen.getByText('感想'))
    
    await waitFor(() => {
      expect(screen.getByText('学習を通して感じたことを自由に書いてください。')).toBeInTheDocument()
    })
  })

  it('保存ボタンが機能する', async () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: 'テスト回答' } })
    
    const saveButton = screen.getByText('保存')
    fireEvent.click(saveButton)
    
    // localStorageに保存されることを確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
    
    // 保存完了メッセージが表示される
    expect(screen.getByText('保存しました')).toBeInTheDocument()
  })

  it('保存された内容が復元される', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      1: ' 保存されたテキスト'
    }))
    
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    expect(textarea).toHaveValue('保存されたテキスト')
  })

  it('リセットボタンが機能する', async () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: 'リセット対象のテキスト' } })
    
    const resetButton = screen.getByText('リセット')
    fireEvent.click(resetButton)
    
    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
  })

  it('自動保存が機能する', async () => {
    jest.useFakeTimers()
    
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: '自動保存テスト' } })
    
    // 3秒後に自動保存される
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
    
    jest.useRealTimers()
  })

  it('プロンプトが空の場合にエラーメッセージを表示する', () => {
    render(<ReflectionPrompt prompts={[]} />)
    
    expect(screen.getByText('プロンプトが設定されていません')).toBeInTheDocument()
  })

  it('カテゴリ別にプロンプトが表示される', () => {
    const mixedPrompts = [
      { id: 1, category: "理解度", question: "理解度について" },
      { id: 2, category: "理解度", question: "理解度について2" },
      { id: 3, category: "感想", question: "感想について" }
    ]
    
    render(<ReflectionPrompt prompts={mixedPrompts} />)
    
    // 理解度カテゴリが表示される
    expect(screen.getByText('理解度')).toBeInTheDocument()
    // 感想カテゴリも存在することを確認（タブとして）
    expect(screen.getAllByRole('button')).toContain(
      expect.objectContaining({ textContent: expect.stringMatching(/感想/) })
    )
  })

  it('長いテキストでも適切に処理される', () => {
    render(<ReflectionPrompt prompts={mockPrompts} />)
    
    const longText = 'あ'.repeat(1000)
    const textarea = screen.getByPlaceholderText('ここに記録してください...')
    fireEvent.change(textarea, { target: { value: longText } })
    
    expect(screen.getByText('1000 文字')).toBeInTheDocument()
    expect(textarea).toHaveValue(longText)
  })
})