'use client';

import { useState } from 'react';
import { Button } from '@/ui/components/ui/button';

interface TaihekiGuideProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TaihekiGuide({ onComplete, onBack }: TaihekiGuideProps) {
  const [currentSection, setCurrentSection] = useState<'overview' | 'types'>('overview');

  const taihekiTypes = [
    {
      number: 1,
      title: "冷静沈着な分析家",
      subtitle: "左右型・能動（L1対応・脳系）",
      color: "bg-blue-500",
      features: [
        { label: "身体特徴", text: "頭部が大きく肩が狭い、縦長の顔立ち" },
        { label: "体型", text: "痩せ型で筋肉がつきにくい、運動が苦手" },
        { label: "思考", text: "論理的で分析的、理屈で物事を判断" },
        { label: "感受性", text: "理論・法則性に興味、知的刺激を求める" },
        { label: "行動", text: "慎重で計画性がある、頭で考えてから行動" },
        { label: "見分け方", text: "自然に右足に重心をかけて立つ" }
      ]
    },
    {
      number: 2,
      title: "協調性のある調整役",
      subtitle: "左右型・受動（L1対応・脳系）",
      color: "bg-purple-500",
      features: [
        { label: "身体特徴", text: "なで肩で首が長い、優しい印象の顔立ち" },
        { label: "体型", text: "華奢で女性的、柔らかい体型" },
        { label: "思考", text: "感情的で理解力がある、他人への配慮" },
        { label: "感受性", text: "人間関係に敏感、調和を重視" },
        { label: "行動", text: "優柔不断だが人当たりが良い、争いを避ける" },
        { label: "見分け方", text: "自然に左足に重心をかけて立つ" }
      ]
    },
    {
      number: 3,
      title: "明るく社交的なムードメーカー",
      subtitle: "左右型・能動（L2対応・消化器系）",
      color: "bg-pink-500",
      features: [
        { label: "身体特徴", text: "丸い肩と均整のとれた体型、明るい表情" },
        { label: "体型", text: "中肉中背でバランスが良い、健康的な印象" },
        { label: "思考", text: "楽観的で前向き、現実的な判断" },
        { label: "感受性", text: "楽しさに敏感、ムードに左右される" },
        { label: "行動", text: "積極的で明るい、人を楽しませることが好き" },
        { label: "見分け方", text: "自然に右足に重心をかけて立つ" }
      ]
    },
    {
      number: 4,
      title: "感情豊かな芸術家",
      subtitle: "左右型・受動（L2対応・消化器系）",
      color: "bg-orange-500",
      features: [
        { label: "身体特徴", text: "角ばった肩で四角い印象、頬骨が高い" },
        { label: "体型", text: "痩せ型で胸が薄く、体重が増えにくい" },
        { label: "思考", text: "感情的な判断、内面の複雑さ" },
        { label: "感受性", text: "感情の変化が激しく、美的感覚に優れる" },
        { label: "行動", text: "批判で気分転換、自分の感情が不明確" },
        { label: "見分け方", text: "自然に左足に重心をかけて立つ" }
      ]
    },
    {
      number: 5,
      title: "行動的な実業家",
      subtitle: "前後型・能動（L3対応・呼吸器系）",
      color: "bg-red-500",
      features: [
        { label: "身体特徴", text: "逆三角形の体型、肩幅が広く前傾姿勢" },
        { label: "体型", text: "胸筋が発達、運動神経が良い、モデル体型" },
        { label: "思考", text: "損得勘定で判断、合理的な計算" },
        { label: "感受性", text: "利益・効率に敏感、実用性を重視" },
        { label: "行動", text: "行動派でリーダーシップを発揮、常に動く" },
        { label: "見分け方", text: "胸を張って肘を後ろに引く姿勢" }
      ]
    },
    {
      number: 6,
      title: "ロマンチックな夢想家",
      subtitle: "前後型・受動（L3対応・呼吸器系）",
      color: "bg-cyan-500",
      features: [
        { label: "身体特徴", text: "猫背で背中が丸い、顎が尖り華奢" },
        { label: "体型", text: "呼吸が浅く体力に不安、上品な雰囲気" },
        { label: "思考", text: "損得は考えるが夢想的、想像力豊か" },
        { label: "感受性", text: "非日常への憧れ、ロマンへの志向" },
        { label: "行動", text: "鬱的になりやすく、他人の支援が必要" },
        { label: "見分け方", text: "骨盤を後ろに引いた猫背の姿勢" }
      ]
    },
    {
      number: 7,
      title: "闘争心旺盛な戦士",
      subtitle: "捻れ型・能動（L4対応・泌尿器系）",
      color: "bg-red-600",
      features: [
        { label: "身体特徴", text: "がっしりした上半身、ファイター体型" },
        { label: "体型", text: "太い腕と発達した背筋、力強い印象" },
        { label: "思考", text: "勝敗の論理、具体的経験を重視" },
        { label: "感受性", text: "勝ち負けに敏感、上下関係を意識" },
        { label: "行動", text: "負けを認めず謝ることが苦手、競争を好む" },
        { label: "見分け方", text: "机に対して斜めに座る、字を書くとき体を傾ける" }
      ]
    },
    {
      number: 8,
      title: "忍耐強い支援者",
      subtitle: "捻れ型・受動（L4対応・泌尿器系）",
      color: "bg-amber-600",
      features: [
        { label: "身体特徴", text: "腰幅が肩幅より広い、胴体が太い" },
        { label: "体型", text: "下半身がしっかり、安定感のある体型" },
        { label: "思考", text: "歴史的比較を好む、長期的視点" },
        { label: "感受性", text: "正義感が強く、弱者への共感" },
        { label: "行動", text: "縁の下の力持ち、我慢強く支援的" },
        { label: "見分け方", text: "下半身の捻りで力を発揮、謙遜する話し方" }
      ]
    },
    {
      number: 9,
      title: "完璧主義の専門家",
      subtitle: "開閉型・能動（L5対応・生殖器系）",
      color: "bg-yellow-500",
      features: [
        { label: "身体特徴", text: "骨盤が非常に狭く、お尻が突き出る" },
        { label: "体型", text: "小柄だが筋肉密度が高い、顔の中心に特徴" },
        { label: "思考", text: "完璧主義で白黒つける、極端な論理" },
        { label: "感受性", text: "愛憎に敏感、中途半端を嫌う" },
        { label: "行動", text: "集中力が極めて高く、恨みを忘れない" },
        { label: "見分け方", text: "膝をつけてかかとを地面につけてしゃがめる" }
      ]
    },
    {
      number: 10,
      title: "包容力のある母性型",
      subtitle: "開閉型・受動（L5対応・生殖器系）",
      color: "bg-green-500",
      features: [
        { label: "身体特徴", text: "骨盤が広く、お尻が横に平たく広がる" },
        { label: "体型", text: "全体的に大きく、どっしりとした安定感" },
        { label: "思考", text: "包容的で寛容、全体を受け入れる" },
        { label: "感受性", text: "愛情に敏感、母性・父性的反応" },
        { label: "行動", text: "人の世話で元気になる、極めて忘れっぽい" },
        { label: "見分け方", text: "しゃがもうとするとかかとが上がり後ろに倒れそうになる" }
      ]
    }
  ];

  if (currentSection === 'overview') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
            <span className="text-white text-2xl font-bold">📚</span>
          </div>
          <div>
            <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
              体癖理論入門ガイド
            </h1>
            <p className="text-body-m-mobile text-light-fg-muted max-w-2xl mx-auto">
              野口整体の体癖理論について基礎知識を学んでから診断に進みましょう。
            </p>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            ステップ 4/5 • 体癖理論学習
          </div>
        </div>

        {/* Theory Overview */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-card p-8 shadow-z2 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-h3-mobile md:text-h3-desktop font-heading text-light-fg mb-4">
                体癖理論とは？
              </h2>
              <div className="w-24 h-1 bg-gradient-brand mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="font-heading text-blue-900 mb-3">理論の基礎</h3>
                  <p className="text-body-s-mobile text-blue-800 leading-relaxed">
                    体癖理論は野口整体の創始者・野口晴哉によって提唱された、人間の身体的・心理的特徴を
                    <strong>10の型</strong>に分類する独自の人間理解システムです。
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="font-heading text-green-900 mb-3">身体と心の関係</h3>
                  <p className="text-body-s-mobile text-green-800 leading-relaxed">
                    体癖は単なる性格分析ではありません。<strong>身体の使い方・姿勢・動作のクセ</strong>が
                    心理的特徴や行動パターンと密接に関連していることを発見した理論です。
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="font-heading text-purple-900 mb-3">5つの運動系</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">1</div>
                      <div>
                        <div className="font-medium text-purple-900">上下系（1〜2種）</div>
                        <div className="text-xs text-purple-700">頭部・首部の緊張パターン</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">2</div>
                      <div>
                        <div className="font-medium text-purple-900">左右系（3〜4種）</div>
                        <div className="text-xs text-purple-700">側腹部・腰部の左右差</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">3</div>
                      <div>
                        <div className="font-medium text-purple-900">前後系（5〜6種）</div>
                        <div className="text-xs text-purple-700">腰椎5番・呼吸器系の前後運動</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">4</div>
                      <div>
                        <div className="font-medium text-purple-900">捻れ系（7〜8種）</div>
                        <div className="text-xs text-purple-700">脊柱・骨盤の左右ねじり</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">5</div>
                      <div>
                        <div className="font-medium text-purple-900">開閉系（9〜10種）</div>
                        <div className="text-xs text-purple-700">胸郭・腹部の上下拡張収縮</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="font-heading text-orange-900 mb-3">主体癖と副体癖</h3>
                  <p className="text-body-s-mobile text-orange-800 leading-relaxed">
                    多くの人は<strong>主体癖</strong>（最も強い特徴）と<strong>副体癖</strong>（二番目の特徴）の
                    組み合わせを持ちます。この組み合わせにより、より複雑で個別性の高い分析が可能になります。
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button
                variant="secondary"
                onClick={onBack}
                className="flex-1"
              >
                ← 選択画面に戻る
              </Button>
              <Button
                onClick={() => setCurrentSection('types')}
                className="flex-1"
              >
                10種の体癖を詳しく見る →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-bold">📋</span>
        </div>
        <div>
          <h1 className="text-h2-mobile md:text-h2-desktop font-heading text-light-fg mb-3">
            10種の体癖タイプ
          </h1>
          <p className="text-body-m-mobile text-light-fg-muted max-w-2xl mx-auto">
            各体癖の特徴を理解して、自分に最も当てはまるタイプを見つけてください。
          </p>
        </div>
      </div>

      {/* Types Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {taihekiTypes.map((type) => (
            <div key={type.number} className="bg-white rounded-card p-6 shadow-z2 hover:shadow-z3 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center text-white text-lg font-bold`}>
                  {type.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-light-fg text-sm leading-tight">
                    {type.title}
                  </h3>
                  <p className="text-xs text-light-fg-muted">
                    {type.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {type.features.map((feature, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium text-light-fg">{feature.label}：</span>
                    <span className="text-light-fg-muted">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-card p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900 text-sm mb-2">
                重要な注意事項
              </h3>
              <p className="text-xs text-yellow-800 leading-relaxed">
                正確な体癖判定には身体的特徴と行動パターンの総合的な観察、および専門家の指導が必要です。
                この診断は参考情報として活用し、自己理解の一助としてお役立てください。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="secondary"
            onClick={() => setCurrentSection('overview')}
            className="flex-1"
          >
            ← 基礎理論に戻る
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1"
          >
            理解できました。診断に進む →
          </Button>
        </div>
      </div>
    </div>
  );
}