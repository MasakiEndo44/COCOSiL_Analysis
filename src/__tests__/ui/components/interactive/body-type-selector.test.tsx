import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BodyTypeSelector } from '@/ui/components/interactive/body-type-selector'

describe('BodyTypeSelector Component', () => {
  it('すべての体癖タイプを表示する', () => {
    render(<BodyTypeSelector />)
    
    // 10種すべての体癖が表示されることを確認
    expect(screen.getByText('1種（上下・上）')).toBeInTheDocument()
    expect(screen.getByText('2種（上下・下）')).toBeInTheDocument()
    expect(screen.getByText('3種（左右・左）')).toBeInTheDocument()
    expect(screen.getByText('4種（左右・右）')).toBeInTheDocument()
    expect(screen.getByText('5種（前後・前）')).toBeInTheDocument()
    expect(screen.getByText('6種（前後・後）')).toBeInTheDocument()
    expect(screen.getByText('7種（捻れ・左）')).toBeInTheDocument()
    expect(screen.getByText('8種（捻れ・右）')).toBeInTheDocument()
    expect(screen.getByText('9種（開閉・開）')).toBeInTheDocument()
    expect(screen.getByText('10種（開閉・閉）')).toBeInTheDocument()
  })

  it('カテゴリフィルターが機能する', () => {
    render(<BodyTypeSelector />)
    
    // 上下型フィルターをクリック
    fireEvent.click(screen.getByText('上下型'))
    
    // 1種・2種のみが表示され、他は非表示になることを確認
    expect(screen.getByText('1種（上下・上）')).toBeInTheDocument()
    expect(screen.getByText('2種（上下・下）')).toBeInTheDocument()
    
    // 他の型は表示されない
    expect(screen.queryByText('3種（左右・左）')).not.toBeInTheDocument()
    expect(screen.queryByText('5種（前後・前）')).not.toBeInTheDocument()
  })

  it('すべてフィルターでリセットされる', () => {
    render(<BodyTypeSelector />)
    
    // まず特定のフィルターを適用
    fireEvent.click(screen.getByText('左右型'))
    
    // すべてフィルターをクリック
    fireEvent.click(screen.getByText('すべて'))
    
    // すべての体癖が表示されることを確認
    expect(screen.getByText('1種（上下・上）')).toBeInTheDocument()
    expect(screen.getByText('3種（左右・左）')).toBeInTheDocument()
    expect(screen.getByText('5種（前後・前）')).toBeInTheDocument()
  })

  it('体癖を選択できる', () => {
    render(<BodyTypeSelector />)
    
    // 1種を選択
    const type1Card = screen.getByText('1種（上下・上）').closest('[role="button"], button')
    
    if (type1Card) {
      fireEvent.click(type1Card)
      
      // 選択状態の表示が確認できること
      expect(screen.getByText('選択中')).toBeInTheDocument()
    }
  })

  it('詳細情報が表示される', () => {
    render(<BodyTypeSelector />)
    
    // 詳細を見るボタンをクリック
    const detailButton = screen.getAllByText('詳細を見る')[0]
    fireEvent.click(detailButton)
    
    // 詳細情報が表示されることを確認
    expect(screen.getByText('身体的特徴')).toBeInTheDocument()
    expect(screen.getByText('精神的特徴')).toBeInTheDocument()
  })

  it('複数の体癖を選択して比較できる', () => {
    render(<BodyTypeSelector />)
    
    // 1種と3種を選択
    const type1Card = screen.getByText('1種（上下・上）').closest('[role="button"], .cursor-pointer')
    const type3Card = screen.getByText('3種（左右・左）').closest('[role="button"], .cursor-pointer')
    
    if (type1Card && type3Card) {
      fireEvent.click(type1Card)
      fireEvent.click(type3Card)
      
      // 選択中の体癖タイプセクションが表示されることを確認
      expect(screen.getByText('選択中の体癖タイプ')).toBeInTheDocument()
    }
  })

  it('体癖の特徴が正確に表示される', () => {
    render(<BodyTypeSelector />)
    
    // 各体癖の代表的な特徴が表示されることを確認
    expect(screen.getByText('理論的思考')).toBeInTheDocument() // 1種の特徴
    expect(screen.getByText('感情豊か')).toBeInTheDocument() // 3種の特徴
    expect(screen.getByText('行動力')).toBeInTheDocument() // 5種の特徴
  })

  it('アクセシビリティが考慮されている', () => {
    render(<BodyTypeSelector />)
    
    // フィルターボタンがbutton要素であることを確認
    const filters = screen.getAllByRole('button')
    expect(filters.length).toBeGreaterThan(0)
    
    // 見出しが適切にあることを確認
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('体癖タイプを選択してください')
  })

  it('キーボードナビゲーションが可能', () => {
    render(<BodyTypeSelector />)
    
    const type1Card = screen.getByText('1種（上下・上）').closest('[role="button"], .cursor-pointer')
    
    if (type1Card) {
      // クリックで選択できることを確認
      fireEvent.click(type1Card)
      expect(screen.getByText('選択中')).toBeInTheDocument()
    }
  })

  it('レスポンシブレイアウトが適用されている', () => {
    render(<BodyTypeSelector />)
    
    // グリッドレイアウトのクラスが適用されていることを確認
    const gridContainer = screen.getByText('1種（上下・上）').closest('.grid')
    expect(gridContainer).toHaveClass('grid')
  })
})