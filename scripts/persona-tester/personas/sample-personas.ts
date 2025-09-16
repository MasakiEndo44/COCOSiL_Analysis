// 体癖1-4種用サンプルペルソナ定義

import { TaihekiPersona } from '../types.js';

export const samplePersonas: TaihekiPersona[] = [
  // 1種 - 論理的・責任感重視タイプ
  {
    id: 'type1_executive',
    type: 1,
    name: '田中理(たなか おさむ)',
    description: '大手企業の品質管理責任者。論理的思考と完璧主義で知られる。',
    demographics: {
      age: 45,
      occupation: '品質管理責任者',
      background: '工学系出身、ISO認証取得経験多数'
    },
    coreTraits: {
      physicalTendencies: [
        '背筋が常にピンと伸びている',
        '首・肩の緊張が慢性的',
        '動作が規則正しく正確',
        '姿勢を正すことを意識している'
      ],
      mentalPatterns: [
        '論理的思考を何より重視',
        '原理原則を大切にする',
        '完璧を求める傾向が強い',
        '責任感が人一倍強い'
      ],
      behavioralStyles: [
        '計画を立ててから行動',
        '他人にも高い基準を求める',
        'ルールや規則を遵守',
        '効率性を重視'
      ],
      stressResponses: [
        '首や肩が凝る',
        '頭痛が起きやすい',
        '睡眠の質が悪化',
        '完璧にできないとイライラ'
      ]
    },
    responsePatterns: [
      {
        questionId: 1,
        mostLikelyChoice: 0, // "相手の目をじっと見て話す"
        alternativeChoices: [2], // "論理的に順序立てて説明する"
        reasoning: '1種は相手と真摯に向き合い、論理的に話すことを重視する',
        confidence: 9
      },
      {
        questionId: 2,
        mostLikelyChoice: 0, // "首や肩が緊張して硬くなる"
        alternativeChoices: [],
        reasoning: '1種の典型的なストレス反応部位',
        confidence: 10
      },
      {
        questionId: 3,
        mostLikelyChoice: 0, // "まず全体像を把握してから詳細を理解する"
        alternativeChoices: [2], // "理論や原理を理解してから実践する"
        reasoning: '体系的・論理的な学習アプローチを好む',
        confidence: 8
      },
      {
        questionId: 4,
        mostLikelyChoice: 0, // "はっきりと意見を述べ、相手と向き合う"
        alternativeChoices: [2], // "冷静に分析し、論理的に反論する"
        reasoning: '直接的で論理的な対応を取る',
        confidence: 9
      },
      {
        questionId: 5,
        mostLikelyChoice: 0, // "静かで整理整頓された空間"
        alternativeChoices: [2], // "必要な資料や道具が揃った機能的な空間"
        reasoning: '秩序と効率性を重視する環境を好む',
        confidence: 8
      }
    ]
  },

  // 2種 - 感情表現豊か・芸術的タイプ
  {
    id: 'type2_artist',
    type: 2,
    name: '佐藤美香(さとう みか)',
    description: 'フリーランスのグラフィックデザイナー。感性豊かで表現力に優れる。',
    demographics: {
      age: 32,
      occupation: 'グラフィックデザイナー',
      background: '美術大学出身、広告代理店勤務を経て独立'
    },
    coreTraits: {
      physicalTendencies: [
        '表情が豊かで感情が顔に出やすい',
        '身振り手振りが大きい',
        '胸部の動きが活発',
        '呼吸が感情に左右されやすい'
      ],
      mentalPatterns: [
        '直感を重視する',
        '感情を大切にする',
        '芸術的センスが高い',
        'インスピレーションを大切にする'
      ],
      behavioralStyles: [
        '感情表現が豊か',
        '創造的な活動を好む',
        '人とのつながりを重視',
        '自由な発想で行動'
      ],
      stressResponses: [
        '胸が苦しくなる',
        '呼吸が浅くなる',
        '感情的に不安定になる',
        '創作意欲が湧かない'
      ]
    },
    responsePatterns: [
      {
        questionId: 1,
        mostLikelyChoice: 1, // "身振り手振りを交えて表現豊かに話す"
        alternativeChoices: [3], // "相手の気持ちを察しながら優しく話す"
        reasoning: '2種は感情豊かで表現力を重視する',
        confidence: 10
      },
      {
        questionId: 2,
        mostLikelyChoice: 1, // "呼吸が浅くなり、胸が苦しくなる"
        alternativeChoices: [],
        reasoning: '2種の典型的なストレス反応（胸部・呼吸器系）',
        confidence: 10
      },
      {
        questionId: 3,
        mostLikelyChoice: 1, // "実際に体験しながら覚えていく"
        alternativeChoices: [3], // "他人から教えてもらいながら覚える"
        reasoning: '体験的・感覚的な学習を好む',
        confidence: 9
      },
      {
        questionId: 4,
        mostLikelyChoice: 1, // "感情的に反応し、身体で表現する"
        alternativeChoices: [],
        reasoning: '感情を直接的に身体で表現する特徴',
        confidence: 10
      },
      {
        questionId: 5,
        mostLikelyChoice: 1, // "開放的で動きやすい空間"
        alternativeChoices: [3], // "リラックスできる居心地の良い空間"
        reasoning: '自由で創造的な環境を好む',
        confidence: 8
      }
    ]
  },

  // 3種 - 分析的・効率重視タイプ
  {
    id: 'type3_analyst',
    type: 3,
    name: '山田博(やまだ ひろし)',
    description: 'IT企業のシステムアナリスト。データ分析と効率化が得意。',
    demographics: {
      age: 38,
      occupation: 'システムアナリスト',
      background: '情報工学博士、データサイエンス専門'
    },
    coreTraits: {
      physicalTendencies: [
        '姿勢は機能的',
        '動作が効率的',
        '胃腸の調子に影響が出やすい',
        '長時間のデスクワークに慣れている'
      ],
      mentalPatterns: [
        '分析的思考が得意',
        '効率性を追求する',
        '客観的判断を重視',
        '知的好奇心が旺盛'
      ],
      behavioralStyles: [
        'データに基づいて判断',
        '計画的で戦略的',
        '無駄を嫌う',
        '継続的改善を志向'
      ],
      stressResponses: [
        '胃腸の調子が悪くなる',
        '消化不良',
        '考えすぎて眠れない',
        '食欲不振'
      ]
    },
    responsePatterns: [
      {
        questionId: 1,
        mostLikelyChoice: 2, // "論理的に順序立てて説明する"
        alternativeChoices: [0], // "相手の目をじっと見て話す"
        reasoning: '3種は論理性と効率性を重視する',
        confidence: 10
      },
      {
        questionId: 2,
        mostLikelyChoice: 2, // "消化器系（胃腸）に症状が現れる"
        alternativeChoices: [],
        reasoning: '3種の典型的なストレス反応部位',
        confidence: 10
      },
      {
        questionId: 3,
        mostLikelyChoice: 2, // "理論や原理を理解してから実践する"
        alternativeChoices: [0], // "まず全体像を把握してから詳細を理解する"
        reasoning: '理論的・体系的な学習アプローチ',
        confidence: 9
      },
      {
        questionId: 4,
        mostLikelyChoice: 2, // "冷静に分析し、論理的に反論する"
        alternativeChoices: [],
        reasoning: '感情よりも論理を優先する',
        confidence: 10
      },
      {
        questionId: 5,
        mostLikelyChoice: 2, // "必要な資料や道具が揃った機能的な空間"
        alternativeChoices: [0], // "静かで整理整頓された空間"
        reasoning: '効率性と機能性を重視',
        confidence: 9
      }
    ]
  },

  // 4種 - 協調性・支援重視タイプ
  {
    id: 'type4_supporter',
    type: 4,
    name: '鈴木和子(すずき かずこ)',
    description: '小学校教師。子どもたちを温かく支援し、協調性を大切にする。',
    demographics: {
      age: 41,
      occupation: '小学校教師',
      background: '教育学部出身、20年の教職経験'
    },
    coreTraits: {
      physicalTendencies: [
        '柔らかい雰囲気',
        'ゆったりとした動作',
        '腰部に負担がかかりやすい',
        '人を包み込むような存在感'
      ],
      mentalPatterns: [
        '他者への思いやりが深い',
        '協調性を重視する',
        '感受性が豊か',
        '調和を大切にする'
      ],
      behavioralStyles: [
        '人を支援することを優先',
        '周囲との調和を図る',
        '相手の立場に立って考える',
        'おだやかな対応'
      ],
      stressResponses: [
        '腰痛',
        '泌尿器系の不調',
        '人間関係のストレスを溜め込む',
        '自分を後回しにしてしまう'
      ]
    },
    responsePatterns: [
      {
        questionId: 1,
        mostLikelyChoice: 3, // "相手の気持ちを察しながら優しく話す"
        alternativeChoices: [1], // "身振り手振りを交えて表現豊かに話す"
        reasoning: '4種は相手への思いやりと協調性を重視',
        confidence: 10
      },
      {
        questionId: 2,
        mostLikelyChoice: 3, // "腰部や泌尿器系に違和感を覚える"
        alternativeChoices: [],
        reasoning: '4種の典型的なストレス反応部位',
        confidence: 10
      },
      {
        questionId: 3,
        mostLikelyChoice: 3, // "他人から教えてもらいながら覚える"
        alternativeChoices: [1], // "実際に体験しながら覚えていく"
        reasoning: '人とのつながりを通じた学習を好む',
        confidence: 9
      },
      {
        questionId: 4,
        mostLikelyChoice: 3, // "内に秘めて、表面的には穏やかに対応する"
        alternativeChoices: [],
        reasoning: '調和を重視し、直接的な対立を避ける',
        confidence: 10
      },
      {
        questionId: 5,
        mostLikelyChoice: 3, // "リラックスできる居心地の良い空間"
        alternativeChoices: [1], // "開放的で動きやすい空間"
        reasoning: '心地よさと居心地の良さを重視',
        confidence: 8
      }
    ]
  }
];

// ペルソナバリエーション（同一体癖型の異なるパターン）
export const personaVariations: TaihekiPersona[] = [
  // 1種のバリエーション
  {
    id: 'type1_researcher',
    type: 1,
    name: '高橋純一(たかはし じゅんいち)',
    description: '大学の物理学教授。研究への探求心と論理性を重視。',
    demographics: {
      age: 52,
      occupation: '大学教授（物理学）',
      background: '理学博士、海外留学経験あり'
    },
    coreTraits: {
      physicalTendencies: [
        '学者らしい姿勢',
        '思考時に首を傾げる癖',
        '長時間の研究で首肩が凝る',
        '規則正しい生活リズム'
      ],
      mentalPatterns: [
        '科学的思考を重視',
        '理論的完璧性を追求',
        '客観的事実を重視',
        '知的誠実性を大切にする'
      ],
      behavioralStyles: [
        '仮説検証型の行動',
        'エビデンスに基づく判断',
        '体系的なアプローチ',
        '持続的な集中力'
      ],
      stressResponses: [
        '研究が進まないと首肩が凝る',
        '頭痛がする',
        '睡眠パターンが乱れる',
        '食事を忘れがち'
      ]
    },
    responsePatterns: [
      {
        questionId: 1,
        mostLikelyChoice: 2, // より論理的なアプローチを選択する傾向
        alternativeChoices: [0],
        reasoning: '研究者として論理的説明を最優先',
        confidence: 9
      },
      {
        questionId: 2,
        mostLikelyChoice: 0,
        alternativeChoices: [],
        reasoning: '同じ1種でもより顕著な首肩の症状',
        confidence: 10
      }
    ]
  }
];