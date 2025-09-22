import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { InteractiveQuiz } from '@/ui/components/interactive/interactive-quiz'

// Mock the learning store
jest.mock('@/lib/zustand/learning-store', () => ({
  useLearningStore: jest.fn(() => ({
    updateQuizScore: jest.fn(),
    setQuizScore: jest.fn(),
    getQuizScore: jest.fn(() => null),
    progress: 0,
  })),
}))

const mockQuestions = [
  {
    id: 'q1',
    question: "テスト質問1",
    options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    correct: 0,
    explanation: "これはテスト用の解説です。"
  },
  {
    id: 'q2',
    question: "テスト質問2",
    options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    correct: 2,
    explanation: "2番目の質問の解説です。"
  }
]

describe('InteractiveQuiz Component', () => {
  it('最初の質問を正しく表示する', () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    expect(screen.getByText('テスト質問1')).toBeInTheDocument()
    expect(screen.getByText('選択肢1')).toBeInTheDocument()
    expect(screen.getByText('選択肢2')).toBeInTheDocument()
    expect(screen.getByText('選択肢3')).toBeInTheDocument()
    expect(screen.getByText('選択肢4')).toBeInTheDocument()
  })

  it('進捗バーが正しく表示される', () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    expect(screen.getByText('質問 1 / 2')).toBeInTheDocument()
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('value', '1')
    expect(progressBar).toHaveAttribute('max', '2')
  })

  it('選択肢をクリックして回答できる', async () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    const firstOption = screen.getByText('選択肢1')
    fireEvent.click(firstOption)
    
    // 選択された選択肢がハイライトされることを確認
    expect(firstOption.closest('button')).toHaveClass('bg-blue-100')
  })

  it('回答後に次の質問へ進める', async () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    // 最初の質問に回答
    const firstOption = screen.getByText('選択肢1')
    fireEvent.click(firstOption)
    
    const nextButton = screen.getByText('次の質問')
    fireEvent.click(nextButton)
    
    // 2番目の質問に移動したことを確認
    await waitFor(() => {
      expect(screen.getByText('テスト質問2')).toBeInTheDocument()
      expect(screen.getByText('質問 2 / 2')).toBeInTheDocument()
    })
  })

  it('最後の質問後に結果を表示する', async () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    // 1問目に正解
    const firstCorrect = screen.getByText('選択肢1')
    fireEvent.click(firstCorrect)
    fireEvent.click(screen.getByText('次の質問'))
    
    await waitFor(() => {
      expect(screen.getByText('テスト質問2')).toBeInTheDocument()
    })
    
    // 2問目に正解
    const secondCorrect = screen.getByText('選択肢C')
    fireEvent.click(secondCorrect)
    fireEvent.click(screen.getByText('結果を見る'))
    
    // 結果画面の表示を確認
    await waitFor(() => {
      expect(screen.getByText('クイズ完了!')).toBeInTheDocument()
      expect(screen.getByText('2/2 正解')).toBeInTheDocument()
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  it('解説が正しく表示される', async () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    // 回答を選択
    const option = screen.getByText('選択肢1')
    fireEvent.click(option)
    
    // 解説が表示されることを確認
    expect(screen.getByText('これはテスト用の解説です。')).toBeInTheDocument()
  })

  it('もう一度挑戦ボタンが機能する', async () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    // クイズを完了
    fireEvent.click(screen.getByText('選択肢1'))
    fireEvent.click(screen.getByText('次の質問'))
    
    await waitFor(() => {
      expect(screen.getByText('テスト質問2')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('選択肢C'))
    fireEvent.click(screen.getByText('結果を見る'))
    
    await waitFor(() => {
      expect(screen.getByText('クイズ完了!')).toBeInTheDocument()
    })
    
    // もう一度挑戦
    fireEvent.click(screen.getByText('もう一度挑戦'))
    
    // 最初の質問に戻ることを確認
    await waitFor(() => {
      expect(screen.getByText('テスト質問1')).toBeInTheDocument()
      expect(screen.getByText('質問 1 / 2')).toBeInTheDocument()
    })
  })

  it('質問が空の場合にエラーハンドリングする', () => {
    render(<InteractiveQuiz id="empty-quiz" questions={[]} />)
    
    expect(screen.getByText('質問が設定されていません')).toBeInTheDocument()
  })

  it('アクセシビリティ属性が適切に設定されている', () => {
    render(<InteractiveQuiz id="test-quiz" questions={mockQuestions} />)
    
    // ARIA属性の確認
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-label', 'クイズの進捗')
    
    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toHaveAttribute('aria-labelledby')
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type')
    })
  })
})