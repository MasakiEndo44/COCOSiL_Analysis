import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BasicInfo, 
  MBTIResult, 
  TaihekiResult, 
  FortuneResult, 
  UserDiagnosisData, 
  DiagnosisStep, 
  AppError 
} from '@/types';
import { generateSessionId, calculateAge } from '@/lib/utils';

interface DiagnosisState {
  // データ
  sessionId: string | null;
  basicInfo: BasicInfo | null;
  mbti: MBTIResult | null;
  taiheki: TaihekiResult | null;
  fortune: FortuneResult | null;
  
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

const calculateStepProgress = (completedSteps: DiagnosisStep[]): number => {
  const stepWeights: Record<DiagnosisStep, number> = {
    basic_info: 20,
    mbti: 20,
    taiheki_learn: 10, // 任意ステップ
    taiheki_test: 30,
    integration: 20
  };
  
  return completedSteps.reduce((total, step) => {
    return total + (stepWeights[step] || 0);
  }, 0);
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
      currentStep: 'basic_info',
      completedSteps: [],
      progress: 0,
      isLoading: false,
      error: null,
      
      // セッション初期化
      initializeSession: () => {
        const sessionId = generateSessionId();
        set({ sessionId, currentStep: 'basic_info', completedSteps: [], progress: 0 });
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
      
      // 進捗管理
      setCurrentStep: (step: DiagnosisStep) => {
        set({ currentStep: step });
      },
      
      completeStep: (step: DiagnosisStep) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          const newCompletedSteps = [...completedSteps, step];
          const progress = calculateStepProgress(newCompletedSteps);
          set({ 
            completedSteps: newCompletedSteps,
            progress 
          });
        }
      },
      
      updateProgress: () => {
        const { completedSteps } = get();
        const progress = calculateStepProgress(completedSteps);
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