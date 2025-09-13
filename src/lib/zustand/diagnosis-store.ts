import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BasicInfo, 
  MBTIResult, 
  TaihekiResult, 
  FortuneResult, 
  UserDiagnosisData, 
  DiagnosisStep, 
  AppError,
  ChatSession,
  ChatSummary
} from '@/types';
import { generateSessionId, calculateAge } from '@/lib/utils';

interface DiagnosisState {
  // データ
  sessionId: string | null;
  basicInfo: BasicInfo | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;
  
  // AIカウンセリングデータ
  chatSession: ChatSession | null;
  chatSummary: ChatSummary | null;
  hasCompletedCounseling: boolean;
  
  // 状態
  currentStep: DiagnosisStep;
  completedSteps: DiagnosisStep[];
  progress: number; // 0-100
  isLoading: boolean;
  error: AppError | null;
  
  // 診断データ統合
  getUserData: () => UserDiagnosisData | null;
}

interface DiagnosisActions {
  // データ設定
  initializeSession: () => void;
  setBasicInfo: (info: BasicInfo) => void;
  setMBTI: (result: MBTIResult) => void;
  setTaiheki: (result: TaihekiResult) => void;
  setFortune: (result: FortuneResult) => void;
  
  // AIカウンセリング設定
  setChatSession: (session: ChatSession) => void;
  setChatSummary: (summary: ChatSummary) => void;
  markCounselingCompleted: (completed: boolean) => void;
  
  // 進捗管理
  setCurrentStep: (step: DiagnosisStep) => void;
  completeStep: (step: DiagnosisStep) => void;
  updateProgress: () => void;
  
  // 状態管理
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  
  // データ操作
  clearAll: () => void;
  exportData: () => UserDiagnosisData | null;
}

type DiagnosisStore = DiagnosisState & DiagnosisActions;

const calculateStepProgress = (currentStep: DiagnosisStep): number => {
  // 単純な1対1対応：現在の画面に基づいた進捗値
  const stepProgressMap: Record<DiagnosisStep, number> = {
    basic_info: 20,      // 基本情報画面 = 20%
    mbti: 40,           // MBTI診断画面 = 40%
    taiheki_learn: 60,  // 体癖学習画面 = 60%（任意ステップ）
    taiheki_test: 80,   // 体癖診断画面 = 80%
    integration: 100    // 結果画面 = 100%
  };
  
  return stepProgressMap[currentStep] || 0;
};

export const useDiagnosisStore = create<DiagnosisStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      sessionId: null,
      basicInfo: null,
      mbti: null,
      taiheki: null,
      fortune: null,
      chatSession: null,
      chatSummary: null,
      hasCompletedCounseling: false,
      currentStep: 'basic_info',
      completedSteps: [],
      progress: 0,
      isLoading: false,
      error: null,
      
      // セッション初期化
      initializeSession: () => {
        const sessionId = generateSessionId();
        set({ 
          sessionId, 
          currentStep: 'basic_info', 
          completedSteps: [], 
          progress: 0,
          basicInfo: null,
          mbti: null,
          taiheki: null,
          fortune: null,
          chatSession: null,
          chatSummary: null,
          hasCompletedCounseling: false,
          isLoading: false,
          error: null
        });
      },
      
      // データ設定
      setBasicInfo: (info: BasicInfo) => {
        const infoWithAge = {
          ...info,
          age: calculateAge(info.birthdate),
          timestamp: new Date()
        };
        
        set({ basicInfo: infoWithAge });
        get().completeStep('basic_info');
      },
      
      setMBTI: (result: MBTIResult) => {
        set({ mbti: result });
        get().completeStep('mbti');
      },
      
      setTaiheki: (result: TaihekiResult) => {
        set({ taiheki: result });
        get().completeStep('taiheki_test');
      },
      
      setFortune: (result: FortuneResult) => {
        set({ fortune: result });
      },
      
      // AIカウンセリング設定
      setChatSession: (session: ChatSession) => {
        set({ chatSession: session });
      },
      
      setChatSummary: (summary: ChatSummary) => {
        set({ chatSummary: summary });
      },
      
      markCounselingCompleted: (completed: boolean) => {
        set({ hasCompletedCounseling: completed });
      },
      
      // 進捗管理
      setCurrentStep: (step: DiagnosisStep) => {
        const progress = calculateStepProgress(step);
        set({ currentStep: step, progress });
      },
      
      completeStep: (step: DiagnosisStep) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          const newCompletedSteps = [...completedSteps, step];
          set({ 
            completedSteps: newCompletedSteps
            // 進捗はsetCurrentStepで管理されるため、ここでは更新不要
          });
        }
      },
      
      updateProgress: () => {
        const { currentStep } = get();
        const progress = calculateStepProgress(currentStep);
        set({ progress });
      },
      
      // 状態管理
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: AppError | null) => {
        set({ error });
      },
      
      // データ統合取得
      getUserData: () => {
        const state = get();
        const { sessionId, basicInfo, mbti, taiheki, fortune, currentStep, completedSteps, progress } = state;
        
        if (!sessionId || !basicInfo) return null;
        
        return {
          id: sessionId,
          basic: basicInfo,
          mbti,
          taiheki,
          fortune,
          progress: {
            step: currentStep,
            percentage: progress,
            completedSteps
          },
          completedAt: progress >= 80 ? new Date() : undefined
        };
      },
      
      // データクリア
      clearAll: () => {
        set({
          sessionId: null,
          basicInfo: null,
          mbti: null,
          taiheki: null,
          fortune: null,
          chatSession: null,
          chatSummary: null,
          hasCompletedCounseling: false,
          currentStep: 'basic_info',
          completedSteps: [],
          progress: 0,
          isLoading: false,
          error: null
        });
      },
      
      // データエクスポート
      exportData: () => {
        return get().getUserData();
      }
    }),
    {
      name: 'cocosil-diagnosis-store', // localStorage のキー名
      partialize: (state) => ({
        sessionId: state.sessionId,
        basicInfo: state.basicInfo,
        mbti: state.mbti,
        taiheki: state.taiheki,
        fortune: state.fortune,
        chatSession: state.chatSession,
        chatSummary: state.chatSummary,
        hasCompletedCounseling: state.hasCompletedCounseling,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        progress: state.progress
      })
    }
  )
);

// データ有効期限チェック用ヘルパー（30日）
export const checkDataExpiry = () => {
  const stored = localStorage.getItem('cocosil-diagnosis-store');
  if (!stored) return false;
  
  try {
    const data = JSON.parse(stored);
    const basicInfo = data.state?.basicInfo;
    if (!basicInfo?.timestamp) return false;
    
    const createdAt = new Date(basicInfo.timestamp);
    const now = new Date();
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays > 30) {
      // 30日経過したデータをクリア
      localStorage.removeItem('cocosil-diagnosis-store');
      return true; // 期限切れ
    }
    
    return false; // まだ有効
  } catch {
    return false;
  }
};