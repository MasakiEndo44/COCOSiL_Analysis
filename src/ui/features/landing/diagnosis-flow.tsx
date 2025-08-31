export function DiagnosisFlow() {
  const steps = [
    {
      number: 1,
      title: "基本情報入力",
      description: "名前・生年月日・既知の診断結果を入力",
      time: "2分",
      color: "bg-blue-500"
    },
    {
      number: 2,
      title: "MBTI診断",
      description: "12問の質問で性格タイプを判定",
      time: "5分",
      color: "bg-purple-500"
    },
    {
      number: 3,
      title: "体癖理論学習",
      description: "診断前に体癖の基礎を学習（任意）",
      time: "5分",
      color: "bg-green-500",
      optional: true
    },
    {
      number: 4,
      title: "体癖診断",
      description: "20問の質問で体癖タイプを判定",
      time: "8分",
      color: "bg-orange-500"
    },
    {
      number: 5,
      title: "統合結果",
      description: "全診断結果の統合分析・結果表示",
      time: "即時",
      color: "bg-pink-500"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg">
          診断の流れ
        </h2>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-2xl mx-auto">
          5つのステップで、あなたの包括的な分析結果を導き出します。
        </p>
      </div>

      {/* Desktop Flow */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              {/* Step Card */}
              <div className="text-center space-y-4">
                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto relative`}>
                  {step.number}
                  {step.optional && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                      任意
                    </span>
                  )}
                </div>
                <div className="max-w-36">
                  <h3 className="font-heading text-light-fg text-sm mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-light-fg-muted leading-relaxed mb-2">
                    {step.description}
                  </p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {step.time}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="mx-4 text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Flow */}
      <div className="md:hidden space-y-6">
        {steps.map((step, index) => (
          <div key={index}>
            <div className="flex items-start space-x-4 p-6 bg-white rounded-card shadow-z1">
              <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 relative`}>
                {step.number}
                {step.optional && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                    任意
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-light-fg">
                    {step.title}
                  </h3>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {step.time}
                  </span>
                </div>
                <p className="text-body-m-mobile text-light-fg-muted">
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Mobile Arrow */}
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Time */}
      <div className="text-center">
        <div className="inline-block bg-gradient-brand text-white px-6 py-3 rounded-xl">
          <span className="text-lg font-semibold">総所要時間：約15-20分</span>
        </div>
      </div>
    </div>
  );
}