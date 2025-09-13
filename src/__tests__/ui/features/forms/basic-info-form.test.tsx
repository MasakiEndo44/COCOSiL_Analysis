import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { BasicInfoForm } from '@/ui/features/forms/basic-info-form'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Zustand store
const mockSetBasicInfo = jest.fn()
const mockSetCurrentStep = jest.fn()
jest.mock('@/lib/zustand/diagnosis-store', () => ({
  useDiagnosisStore: () => ({
    setBasicInfo: mockSetBasicInfo,
    setCurrentStep: mockSetCurrentStep,
  }),
}))

describe('BasicInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders all form fields', () => {
    render(<BasicInfoForm />)
    
    expect(screen.getByLabelText(/お名前/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/性別/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/生年月日.*年/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/生年月日.*月/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/生年月日.*日/i)).toBeInTheDocument()
  })

  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/名前を入力してください/i)).toBeInTheDocument()
      expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument()
    })
  })

  test('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    const emailInput = screen.getByLabelText(/メールアドレス/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument()
    })
  })

  test('shows validation error for invalid birth year', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    const yearInput = screen.getByLabelText(/生年月日.*年/i)
    await user.type(yearInput, '1800') // 無効な年
    
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/1900年から2025年の間で入力してください/i)).toBeInTheDocument()
    })
  })

  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    // フォームに入力
    await user.type(screen.getByLabelText(/お名前/i), '山田太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'yamada@example.com')
    await user.selectOptions(screen.getByLabelText(/性別/i), 'male')
    await user.type(screen.getByLabelText(/生年月日.*年/i), '1990')
    await user.selectOptions(screen.getByLabelText(/生年月日.*月/i), '5')
    await user.selectOptions(screen.getByLabelText(/生年月日.*日/i), '15')
    
    // プライバシーポリシーに同意
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシーに同意/i)
    await user.click(privacyCheckbox)
    
    // フォーム送信
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSetBasicInfo).toHaveBeenCalledWith({
        name: '山田太郎',
        email: 'yamada@example.com',
        gender: 'male',
        birthdate: {
          year: 1990,
          month: 5,
          day: 15
        },
        timestamp: expect.any(Date)
      })
      expect(mockSetCurrentStep).toHaveBeenCalledWith('mbti')
      expect(mockPush).toHaveBeenCalledWith('/diagnosis/mbti')
    })
  })

  test('requires privacy policy agreement', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    // フォームに有効なデータを入力（プライバシーポリシー以外）
    await user.type(screen.getByLabelText(/お名前/i), '山田太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'yamada@example.com')
    await user.selectOptions(screen.getByLabelText(/性別/i), 'male')
    await user.type(screen.getByLabelText(/生年月日.*年/i), '1990')
    await user.selectOptions(screen.getByLabelText(/生年月日.*月/i), '5')
    await user.selectOptions(screen.getByLabelText(/生年月日.*日/i), '15')
    
    // プライバシーポリシーにチェックを入れずに送信
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/プライバシーポリシーに同意してください/i)).toBeInTheDocument()
    })
    
    expect(mockSetBasicInfo).not.toHaveBeenCalled()
  })

  test('validates birth date properly', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    // 無効な日付（2月30日）を入力
    await user.type(screen.getByLabelText(/生年月日.*年/i), '2000')
    await user.selectOptions(screen.getByLabelText(/生年月日.*月/i), '2')
    await user.selectOptions(screen.getByLabelText(/生年月日.*日/i), '30')
    
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/有効な日付を入力してください/i)).toBeInTheDocument()
    })
  })

  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(<BasicInfoForm />)
    
    // フォームに有効なデータを入力
    await user.type(screen.getByLabelText(/お名前/i), '山田太郎')
    await user.type(screen.getByLabelText(/メールアドレス/i), 'yamada@example.com')
    await user.selectOptions(screen.getByLabelText(/性別/i), 'male')
    await user.type(screen.getByLabelText(/生年月日.*年/i), '1990')
    await user.selectOptions(screen.getByLabelText(/生年月日.*月/i), '5')
    await user.selectOptions(screen.getByLabelText(/生年月日.*日/i), '15')
    await user.click(screen.getByLabelText(/プライバシーポリシーに同意/i))
    
    // 送信ボタンをクリック
    const submitButton = screen.getByRole('button', { name: /次へ進む/i })
    await user.click(submitButton)
    
    // ローディング状態を確認（短時間）
    expect(screen.getByRole('button', { name: /送信中/i })).toBeInTheDocument()
  })
})