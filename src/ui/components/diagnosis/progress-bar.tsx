'use client';

import { useDiagnosisStore } from '@/lib/zustand/diagnosis-store';

export function ProgressBar() {
  const { progress, currentStep, completedSteps } = useDiagnosisStore();

  const steps = [
    { key: 'basic_info', label: '基本情報', weight: 20 },
    { key: 'mbti', label: 'MBTI', weight: 20 },
    { key: 'taiheki_learn', label: '学習', weight: 10, optional: true },
    { key: 'taiheki_test', label: '体癖診断', weight: 30 },
    { key: 'integration', label: '結果', weight: 20 }
  ];

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-brand transition-all duration-500 ease-out"
              style={{ width: `${progress === 0 ? 0 : Math.max(progress, 5)}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-foreground min-w-12 text-right">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Step Indicators - Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key as any);
          const isCurrent = currentStep === step.key;
          const isOptional = step.optional;
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  
                  {isOptional && !isCompleted && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs px-1 py-0.5 rounded-full font-medium text-[10px]">
                      任意
                    </span>
                  )}
                </div>
                
                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  completedSteps.includes(steps[index + 1].key as any) 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Indicators - Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.key as any);
            const isCurrent = currentStep === step.key;
            
            return (
              <div
                key={step.key}
                className={`w-2 h-2 rounded-full transition-all ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent 
                      ? 'bg-brand-500' 
                      : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>
        
        {/* Current Step Label */}
        <div className="text-center mt-2">
          <p className="text-sm font-medium text-foreground">
            {steps.find(s => s.key === currentStep)?.label || '診断中'}
          </p>
        </div>
      </div>
    </div>
  );
}