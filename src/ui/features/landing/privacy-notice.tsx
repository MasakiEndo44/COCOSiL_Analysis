export function PrivacyNotice() {
  const privacyPoints = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "データ自動削除",
      description: "個人情報は診断完了から30日後に自動的に削除されます。"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "目的限定使用",
      description: "収集したデータは診断・分析目的以外には一切使用しません。"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6-3a9.97 9.97 0 01-1.563 3.029M21 3l-6.878 6.878" />
        </svg>
      ),
      title: "匿名化処理",
      description: "分析データは完全に匿名化され、個人を特定できません。"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
      title: "研究・改善のみ",
      description: "匿名化されたデータは診断精度向上の研究にのみ使用します。"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg">
          プライバシーへの配慮
        </h2>
        <p className="text-body-l-mobile md:text-body-l-desktop text-light-fg-muted max-w-2xl mx-auto">
          あなたの個人情報とプライバシーを最優先に保護します。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {privacyPoints.map((point, index) => (
          <div 
            key={index}
            className="flex items-start space-x-4 p-6 bg-white rounded-card shadow-z1"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
              {point.icon}
            </div>
            <div>
              <h3 className="font-heading text-light-fg mb-2">
                {point.title}
              </h3>
              <p className="text-body-m-mobile text-light-fg-muted leading-relaxed">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-card p-6 max-w-3xl mx-auto">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              重要：医療診断ではありません
            </h3>
            <p className="text-sm text-yellow-800 leading-relaxed">
              この診断は自己理解を深めるための参考情報です。医療・心理学的診断や治療の代替にはなりません。
              重要な人生の決定や健康に関わる問題については、必ず専門家にご相談ください。
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="text-center">
        <p className="text-body-s-mobile text-light-fg-muted">
          プライバシーに関するご質問やデータ削除のご要望は、
          <br />
          <a href="mailto:privacy@cocosil.example.com" className="text-brand-500 hover:underline">
            privacy@cocosil.example.com
          </a>
          までお問い合わせください。
        </p>
      </div>
    </div>
  );
}