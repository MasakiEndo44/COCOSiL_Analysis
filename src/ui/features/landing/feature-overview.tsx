export function FeatureOverview() {
  const features = [
    {
      title: "体癖理論診断",
      description: "野口整体の体癖理論に基づく20問の診断で、あなたの身体的・心理的特徴を分析します。",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "bg-blue-500"
    },
    {
      title: "MBTI性格分析",
      description: "16の性格タイプから、あなたの心理的傾向と思考パターンを明らかにします。",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "bg-purple-500"
    },
    {
      title: "算命学・動物占い",
      description: "生年月日から東洋の占術で運勢と性格の傾向を読み解きます。",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: "bg-yellow-500"
    },
    {
      title: "星座占い",
      description: "12星座の特性から西洋占星術的な性格傾向を読み解きます。",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      color: "bg-indigo-500"
    },
    {
      title: "AI統合分析",
      description: "全5つの診断結果をAIが統合し、より深い自己理解と洞察を提供します。",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-green-500"
    }
  ];

  return (
    <div className="text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg">
          AI統合による5つの診断手法
        </h2>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-3xl mx-auto">
          体癖理論・MBTI・算命学・動物占い・星座占いをAIが統合分析。異なる理論体系の診断を組み合わせることで、より立体的で正確な自己理解が可能になります。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white p-8 rounded-card shadow-z1 hover:shadow-z2 transition-all text-left"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-h3-mobile font-heading text-light-fg mb-3">
                  {feature.title}
                </h3>
                <p className="text-body-m-mobile text-light-fg-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-brand-soft p-8 rounded-modal">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-h3-mobile font-heading text-light-fg mb-4">
            なぜAI統合診断なのか？
          </h3>
          <p className="text-body-m-mobile text-light-fg-muted leading-relaxed">
            単一の診断では見えない多面的な人間性を、AIが5つの理論を統合し複数の視点から捉えることで、
            より深く正確な自己理解と成長のヒントを得ることができます。
          </p>
        </div>
      </div>

      {/* Pricing Information */}
      <div className="bg-white border border-brand-200 rounded-modal p-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-h3-mobile font-heading text-light-fg mb-6 text-center">
            料金プラン
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-lg text-gray-900 mb-2">基本診断</h4>
              <p className="text-3xl font-bold text-green-600 mb-4">無料</p>
              <p className="text-sm text-gray-600">基本的な診断結果とAI分析</p>
            </div>
            <div className="text-center p-6 bg-brand-50 border-2 border-brand-300 rounded-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-500 text-white px-3 py-1 rounded-full text-xs">
                おすすめ
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">詳細分析</h4>
              <p className="text-3xl font-bold text-brand-600 mb-4">¥500<span className="text-sm">/月</span></p>
              <p className="text-sm text-gray-600">詳細レポート・日次アドバイス</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-lg text-gray-900 mb-2">プレミアム</h4>
              <p className="text-3xl font-bold text-purple-600 mb-4">¥800<span className="text-sm">/月</span></p>
              <p className="text-sm text-gray-600">無制限AI相談・専門家監修</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}