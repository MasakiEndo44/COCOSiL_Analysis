// 体癖5-10種用詳細ペルソナ定義
// 野口整体理論に基づく前後型・捻れ型・開閉型の科学的モデリング

import { TaihekiPersona } from '../types.js';

export const extendedPersonas: TaihekiPersona[] = [
  // 5種 - 前後型・奇数（積極的合理主義者）
  {
    id: 'type5_executive',
    type: 5,
    name: '前田健太(まえだ けんた)',
    description: '営業部長。エネルギッシュで行動力があり、複数のプロジェクトを同時に推進する。',
    demographics: {
      age: 42,
      occupation: '営業部長',
      background: '体育会系出身、MBA取得、複数の事業立ち上げ経験'
    },
    coreTraits: {
      physicalTendencies: [
        '肩幅が広くV字型の体型',
        '胸を張って上半身が発達',
        '立つ・歩く時に上半身がよく動く',
        '上半身に汗をかきやすい',
        '前屈み（猫背）になりがち'
      ],
      mentalPatterns: [
        '行動的で積極的な合理主義者',
        '損得勘定が得意',
        'スポーツマンタイプの思考',
        '目立ちたがり屋',
        '所有欲が強いが手に入ると興味を失う'
      ],
      behavioralStyles: [
        '動きながら考える',
        '複数作業を同時に進める',
        '人を集めて賑やかに過ごす',
        '窮地に追い込まれると力を発揮',
        'じっとしているのが苦手'
      ],
      stressResponses: [
        '衝動買いや冒険的行動で発散',
        '先の見通しが立たないと疲れ果てる',
        '行動で解決しようとする',
        'エネルギー発散を求める'
      ]
    },
    responsePatterns: [
      {
        questionId: 7,
        mostLikelyChoice: 0, // "積極的にすぐ行動に移す"
        alternativeChoices: [],
        reasoning: '5種は前後型奇数で、積極的な行動パターンが典型的',
        confidence: 10
      },
      {
        questionId: 8,
        mostLikelyChoice: 0, // "胸を張って肩幅の広いV字型体型"
        alternativeChoices: [],
        reasoning: '5種の典型的な身体特徴',
        confidence: 10
      },
      {
        questionId: 9,
        mostLikelyChoice: 0, // "行動しながら考え、複数のことを同時に進める"
        alternativeChoices: [],
        reasoning: '5種の特徴的なエネルギー使用パターン',
        confidence: 10
      },
      {
        questionId: 18,
        mostLikelyChoice: 0, // "行動力で人を引っ張っていく"
        alternativeChoices: [],
        reasoning: '5種の積極的リーダーシップスタイル',
        confidence: 9
      },
      {
        questionId: 21,
        mostLikelyChoice: 0, // "外に向かって発散することでバランスを取る"
        alternativeChoices: [],
        reasoning: '奇数種の典型的なエネルギー発散パターン',
        confidence: 10
      }
    ]
  },

  // 6種 - 前後型・偶数（慎重な理想主義者）
  {
    id: 'type6_idealist',
    type: 6,
    name: '安田静香(やすだ しずか)',
    description: 'フリーライター。理想への情熱を内に秘め、夜型で言葉を通じて表現する。',
    demographics: {
      age: 35,
      occupation: 'フリーライター・ジャーナリスト',
      background: '文学部出身、新聞社勤務を経て独立、社会問題に関心'
    },
    coreTraits: {
      physicalTendencies: [
        '顎を突き出したり、肩が前に出る',
        '前屈みの姿勢になりがち',
        '顎が尖っていたり、しゃくれている',
        'スラッとして手足が長い',
        '呼吸器が弱く息切れしやすい'
      ],
      mentalPatterns: [
        '理想への情熱を内に秘める',
        '言葉でエネルギーを発散',
        '夜型で夜になると活動的',
        '非日常的な出来事で元気になる',
        '普段は陰気で自信なさそう'
      ],
      behavioralStyles: [
        '一人で静かに楽しむ',
        'プレッシャーに弱い',
        '力が抜けると物事がうまくいく',
        '意識すると肩に力が入る',
        '行動よりも言葉で表現'
      ],
      stressResponses: [
        '思うように行動できなくなる',
        '肩に力が入りすぎる',
        '理想と現実のギャップに悩む',
        '夜型リズムが乱れると不調'
      ]
    },
    responsePatterns: [
      {
        questionId: 7,
        mostLikelyChoice: 1, // "慎重に考えてから行動する"
        alternativeChoices: [],
        reasoning: '6種は前後型偶数で、慎重なアプローチが典型的',
        confidence: 10
      },
      {
        questionId: 8,
        mostLikelyChoice: 1, // "顎を突き出し、前屈みになりがち"
        alternativeChoices: [],
        reasoning: '6種の典型的な身体特徴',
        confidence: 10
      },
      {
        questionId: 9,
        mostLikelyChoice: 1, // "言葉や理想で情熱を燃やし、夜型になりがち"
        alternativeChoices: [],
        reasoning: '6種の特徴的なエネルギー使用パターン',
        confidence: 10
      },
      {
        questionId: 19,
        mostLikelyChoice: 0, // "理想への情熱で判断し、言葉で表現する"
        alternativeChoices: [],
        reasoning: '6種の直感的判断パターン',
        confidence: 9
      },
      {
        questionId: 21,
        mostLikelyChoice: 1, // "内に溜め込むことでバランスを取る"
        alternativeChoices: [],
        reasoning: '偶数種の典型的なエネルギー蓄積パターン',
        confidence: 10
      }
    ]
  },

  // 7種 - 捻れ型・奇数（批判的分析者）
  {
    id: 'type7_critic',
    type: 7,
    name: '山田博士(やまだ ひろし)',
    description: '大学准教授（社会学）。批判的思考と分析力に長け、議論を通じて真理を追求する。',
    demographics: {
      age: 45,
      occupation: '大学准教授（社会学）',
      background: '博士号取得、批判理論専門、ディベート大会審査員'
    },
    coreTraits: {
      physicalTendencies: [
        '左肩が前に出やすく、右腰が前へ',
        '立つと左足が半歩前に出る',
        '左肋骨が開きやすい',
        '腕組み時に左腕が上になる',
        '脊柱が左右にねじれやすい'
      ],
      mentalPatterns: [
        '左脳（論理）でひねって考え、右脳（感性）でまとめる',
        '批判的・分析好み',
        '皮肉やユーモアが効く',
        '段取りが巧み',
        '問題点から話し始める'
      ],
      behavioralStyles: [
        '計画→実行で段取り重視',
        '議論で相手を追い込むのが得意',
        '「つまり」「要するに」で要点をまとめる',
        '斜めの動き・視点・発想を好む',
        '感情が渦巻くように高まる'
      ],
      stressResponses: [
        '批判的分析や議論で発散',
        '肋骨下部に重心がある感覚',
        '左側の身体に症状が出やすい',
        '論理と感性のバランスが崩れる'
      ]
    },
    responsePatterns: [
      {
        questionId: 10,
        mostLikelyChoice: 0, // "左腕が上になる"
        alternativeChoices: [],
        reasoning: '7種の典型的な左捻れ特徴',
        confidence: 10
      },
      {
        questionId: 11,
        mostLikelyChoice: 0, // "左足が半歩前に出る"
        alternativeChoices: [],
        reasoning: '7種の立位姿勢の特徴',
        confidence: 10
      },
      {
        questionId: 12,
        mostLikelyChoice: 0, // "まず問題点や課題から話し始める"
        alternativeChoices: [2], // "「つまり」「要するに」で要点をまとめる"
        reasoning: '7種の批判的思考パターン',
        confidence: 9
      },
      {
        questionId: 16,
        mostLikelyChoice: 0, // "論理的に段取りを組んで効率的に進める"
        alternativeChoices: [],
        reasoning: '7種の論理性と積極性の組み合わせ',
        confidence: 8
      },
      {
        questionId: 20,
        mostLikelyChoice: 0, // "批判的な分析や議論で発散する"
        alternativeChoices: [],
        reasoning: '7種の特徴的なストレス発散方法',
        confidence: 10
      }
    ]
  },

  // 8種 - 捻れ型・偶数（直感的表現者）
  {
    id: 'type8_performer',
    type: 8,
    name: '佐藤美穂(さとう みほ)',
    description: 'イベントプランナー。直感とインスピレーションで行動し、人を楽しませることが得意。',
    demographics: {
      age: 33,
      occupation: 'イベントプランナー',
      background: '演劇部出身、イベント企画会社勤務、フリーランス'
    },
    coreTraits: {
      physicalTendencies: [
        '右肩が前、左腰が前に出る',
        '立つと右足が半歩前に出る',
        '右肋骨が開きやすい',
        '写真撮影時に顔が右に傾く',
        '身振り手振りが大きく右手が先行'
      ],
      mentalPatterns: [
        '直感・感性が先行し、後で言語化',
        'ムードメーカー型',
        '情が移りやすい',
        'インスピレーション重視',
        '「なんとなく」「感じ」で判断'
      ],
      behavioralStyles: [
        'インスピレーションで即行動',
        '急にスケジュールを変えがち',
        '話しながら身振りが大きい',
        '「なんか」「たとえば」で説明開始',
        '感性を活かした自由な行動'
      ],
      stressResponses: [
        '身振り手振りで表現しながら発散',
        '右側の身体に症状が出やすい',
        '感性が鈍ると不調',
        '型にはまると窮屈感'
      ]
    },
    responsePatterns: [
      {
        questionId: 10,
        mostLikelyChoice: 1, // "右腕が上になる"
        alternativeChoices: [],
        reasoning: '8種の典型的な右捻れ特徴',
        confidence: 10
      },
      {
        questionId: 11,
        mostLikelyChoice: 1, // "右足が半歩前に出る"
        alternativeChoices: [],
        reasoning: '8種の立位姿勢の特徴',
        confidence: 10
      },
      {
        questionId: 12,
        mostLikelyChoice: 1, // "「なんとなく」「感じとして」から話し始める"
        alternativeChoices: [3], // "「たとえば」「なんか」で具体例から入る"
        reasoning: '8種の感性先行の思考パターン',
        confidence: 9
      },
      {
        questionId: 19,
        mostLikelyChoice: 1, // "感性が先行し、後で言語化する"
        alternativeChoices: [],
        reasoning: '8種の直感的判断パターン',
        confidence: 10
      },
      {
        questionId: 20,
        mostLikelyChoice: 1, // "身振り手振りで表現しながら発散する"
        alternativeChoices: [],
        reasoning: '8種の特徴的なストレス発散方法',
        confidence: 10
      }
    ]
  },

  // 9種 - 開閉型・奇数（拡大志向の理想家）
  {
    id: 'type9_visionary',
    type: 9,
    name: '高橋大志(たかはし たいし)',
    description: 'スタートアップCEO。壮大なビジョンを描き、チームを巻き込んで事業を拡大する。',
    demographics: {
      age: 38,
      occupation: 'スタートアップCEO',
      background: 'MBA取得、複数の事業立ち上げ、グローバル展開経験'
    },
    coreTraits: {
      physicalTendencies: [
        '胸郭が大きく開き、肩甲骨が後へ',
        '手足も長めに見え、縦長シルエット',
        '姿勢は「バンザイ」気味',
        '深呼吸で胸が縦にも横にもよく膨らむ',
        '座っていても脚を前へ投げ出しやすい'
      ],
      mentalPatterns: [
        '拡大志向で理想・夢を語るとエネルギーが湧く',
        '大らかで人を巻き込む',
        '細部は苦手',
        '「もし」「もっと」で可能性を追求',
        '規模感・将来像をまず描く'
      ],
      behavioralStyles: [
        '気分が乗ると過多なほどに活動',
        '落ちると一気に停止',
        '「制限なく何でもできるとしたら？」に即答',
        '壮大な話をする',
        '縦の動き・全身スケールでの伸び縮み'
      ],
      stressResponses: [
        '拡大しすぎて収拾がつかなくなる',
        '理想と現実のギャップに落ち込む',
        '膨張⇄収縮の激しい変動',
        '胸郭中央に重心がある感覚'
      ]
    },
    responsePatterns: [
      {
        questionId: 13,
        mostLikelyChoice: 0, // "胸が縦にも横にもよく膨らむ"
        alternativeChoices: [],
        reasoning: '9種の典型的な開閉型上開の身体特徴',
        confidence: 10
      },
      {
        questionId: 14,
        mostLikelyChoice: 0, // "即座に壮大な理想や夢を語る"
        alternativeChoices: [],
        reasoning: '9種の拡大志向的思考パターン',
        confidence: 10
      },
      {
        questionId: 15,
        mostLikelyChoice: 0, // "一気に膨らみ、一気にしぼむ"
        alternativeChoices: [],
        reasoning: '9種の典型的な気分変動パターン',
        confidence: 10
      },
      {
        questionId: 22,
        mostLikelyChoice: 0, // "気分が乗ると過多活動、落ちると一気に停止"
        alternativeChoices: [],
        reasoning: '9種のプレッシャー反応パターン',
        confidence: 9
      },
      {
        questionId: 24,
        mostLikelyChoice: 2, // "「もし」「もっと」"
        alternativeChoices: [],
        reasoning: '9種の特徴的な枕詞',
        confidence: 8
      }
    ]
  },

  // 10種 - 開閉型・偶数（慎重な継続者）
  {
    id: 'type10_steadfast',
    type: 10,
    name: '鈴木堅実(すずき けんじつ)',
    description: '経理部長。長期的視点でリスクを管理し、着実に業務を継続する。',
    demographics: {
      age: 48,
      occupation: '経理部長',
      background: '経済学部出身、公認会計士、財務分析専門'
    },
    coreTraits: {
      physicalTendencies: [
        'みぞおち以下をギュッと締める',
        '丹田が強い',
        '肩が前に入り、背中が丸まる',
        '前屈み傾向',
        'ものを握る力が強めで離しにくい'
      ],
      mentalPatterns: [
        '収縮志向で守り・保守・蓄積を好む',
        '慎重・寡黙で内省が深い',
        '頑固な面もある',
        '「でも」「まず」でリスクを考える',
        '実行可能性・リスクを先に計算'
      ],
      behavioralStyles: [
        'コツコツ続ける',
        '突然の拡大より、安定と継続を選ぶ',
        '質問に対し、まずリスクや不安を挙げる',
        '体を倒さずに前屈すると手が床に近づく',
        '両足をそろえて立つ傾向'
      ],
      stressResponses: [
        '慎重になりすぎて行動できない',
        '収縮しすぎて視野が狭くなる',
        '下半身に症状が出やすい',
        '変化への抵抗感'
      ]
    },
    responsePatterns: [
      {
        questionId: 13,
        mostLikelyChoice: 1, // "みぞおち以下がギュッと締まる感覚"
        alternativeChoices: [],
        reasoning: '10種の典型的な開閉型下閉の身体特徴',
        confidence: 10
      },
      {
        questionId: 14,
        mostLikelyChoice: 1, // "まずリスクや実現可能性を考える"
        alternativeChoices: [],
        reasoning: '10種の収縮志向的思考パターン',
        confidence: 10
      },
      {
        questionId: 15,
        mostLikelyChoice: 1, // "内向きに収縮し、じっくり溜め込む"
        alternativeChoices: [],
        reasoning: '10種の典型的な気分変動パターン',
        confidence: 10
      },
      {
        questionId: 22,
        mostLikelyChoice: 1, // "力が抜けると好調、プレッシャーに弱い"
        alternativeChoices: [],
        reasoning: '10種のプレッシャー反応パターン（6種と類似）',
        confidence: 8
      },
      {
        questionId: 24,
        mostLikelyChoice: 3, // "「でも」「まず」"
        alternativeChoices: [],
        reasoning: '10種の特徴的な枕詞',
        confidence: 8
      }
    ]
  }
];

// バリエーションペルソナ（同一体癖型の異なるパターン）
export const extendedPersonaVariations: TaihekiPersona[] = [
  // 5種のバリエーション - アスリート型
  {
    id: 'type5_athlete',
    type: 5,
    name: '田中アクティブ(たなか あくてぃぶ)',
    description: 'プロスポーツトレーナー。身体能力を活かし、チーム全体のパフォーマンス向上を図る。',
    demographics: {
      age: 36,
      occupation: 'プロスポーツトレーナー',
      background: '体育大学出身、オリンピック選手サポート経験'
    },
    coreTraits: {
      physicalTendencies: [
        '筋肉質でV字型の理想的な体型',
        '反応速度が早く、瞬発力がある',
        '呼吸器が非常に丈夫',
        '動作が機敏で効率的'
      ],
      mentalPatterns: [
        '勝負の世界での合理的思考',
        '目標達成への強い意欲',
        'チームワークを重視',
        '結果重視の現実主義'
      ],
      behavioralStyles: [
        '率先して身体を動かす',
        '競争を楽しむ',
        '仲間を巻き込んで活動',
        '短期集中型の作業スタイル'
      ],
      stressResponses: [
        '運動不足でストレスが溜まる',
        '目標がないと無気力になる',
        '身体を動かして解決',
        'チーム戦で力を発揮'
      ]
    },
    responsePatterns: [
      {
        questionId: 7,
        mostLikelyChoice: 0, // より積極的な行動パターン
        alternativeChoices: [],
        reasoning: 'アスリート型5種はより顕著な積極性',
        confidence: 10
      },
      {
        questionId: 26,
        mostLikelyChoice: 1, // "身体を動かして汗をかく"
        alternativeChoices: [],
        reasoning: 'スポーツトレーナーとしての典型的回復方法',
        confidence: 10
      }
    ]
  },

  // 8種のバリエーション - アーティスト型
  {
    id: 'type8_artist',
    type: 8,
    name: '山田クリエイト(やまだ くりえいと)',
    description: 'ミュージシャン・音楽プロデューサー。感性を活かした音楽制作で多くの人を魅了する。',
    demographics: {
      age: 41,
      occupation: 'ミュージシャン・音楽プロデューサー',
      background: '音楽大学出身、バンド活動からプロデューサーへ転身'
    },
    coreTraits: {
      physicalTendencies: [
        '楽器演奏時の右手の器用さ',
        '音楽に合わせた身体の動き',
        'リズム感のある話し方',
        '感情が身体表現に現れる'
      ],
      mentalPatterns: [
        '音楽的感性が全てのベース',
        'インスピレーションを大切にする',
        '感情の波を音楽で表現',
        '直感的な判断を信頼'
      ],
      behavioralStyles: [
        '即興演奏のような行動',
        '感情の赴くまま創作',
        '他者との音楽的なやり取り',
        '型にはまらない自由な発想'
      ],
      stressResponses: [
        '音楽制作で発散',
        '楽器を演奏してリセット',
        '感性が鈍ると深刻なストレス',
        '創作活動で回復'
      ]
    },
    responsePatterns: [
      {
        questionId: 12,
        mostLikelyChoice: 1, // 感性先行の説明パターン
        alternativeChoices: [],
        reasoning: 'ミュージシャンとしての感性重視',
        confidence: 10
      },
      {
        questionId: 27,
        mostLikelyChoice: 1, // "インスピレーションから生まれる芸術的表現"
        alternativeChoices: [],
        reasoning: '音楽家としての創造性パターン',
        confidence: 10
      }
    ]
  }
];

// 混合型・境界ケースペルソナ
export const boundaryPersonas: TaihekiPersona[] = [
  // 1-3種境界（論理性の共通点）
  {
    id: 'type1_3_boundary',
    type: 1, // 主体癖1種、副体癖3種想定
    name: '理論実践(りろん じっせん)',
    description: '大学教授兼コンサルタント。理論と実践の両方を重視する。',
    demographics: {
      age: 50,
      occupation: '大学教授・経営コンサルタント',
      background: '理工学博士、経営学修士、理論と現場の両方に精通'
    },
    coreTraits: {
      physicalTendencies: [
        '首筋に緊張感があるが機能的な姿勢',
        '胃腸への影響も時々現れる',
        '論理的思考時の身体の硬さ',
        '効率的な動作パターン'
      ],
      mentalPatterns: [
        '原理原則と効率性の両方を重視',
        '完璧主義と分析思考の混合',
        '理論的基盤のある実用性',
        '客観性と信念の両立'
      ],
      behavioralStyles: [
        '体系的かつ効率的なアプローチ',
        '理念と結果の両方を追求',
        '教育者として論理的説明',
        'コンサルタントとして分析的提案'
      ],
      stressResponses: [
        '首肩の緊張と胃腸の不調が混合',
        '完璧さと効率の板挟み',
        '理論と現実のギャップストレス',
        '論理的分析で対処'
      ]
    },
    responsePatterns: [
      {
        questionId: 16,
        mostLikelyChoice: 0, // "原理原則を重視し、信念を貫く"
        alternativeChoices: [1], // "データや事実を分析し、効率を追求する"
        reasoning: '1種の信念と3種の分析力の境界例',
        confidence: 6
      }
    ]
  },

  // 7-8種境界（捻れ型の共通点）
  {
    id: 'type7_8_boundary',
    type: 7, // 主体癖7種、副体癖8種想定
    name: '分析感性(ぶんせき かんせい)',
    description: 'クリエイティブディレクター。論理的分析と直感的感性を使い分ける。',
    demographics: {
      age: 39,
      occupation: 'クリエイティブディレクター',
      background: '広告代理店勤務、論理と感性の両方を活用'
    },
    coreTraits: {
      physicalTendencies: [
        '左右どちらの肩も前に出ることがある',
        '足の位置が状況により変わる',
        '捻れの方向が一定しない',
        '身振り手振りと分析的説明が混在'
      ],
      mentalPatterns: [
        '批判的思考と直感的判断の混合',
        '論理で入り感性で仕上げる',
        '皮肉とユーモアの両方を使う',
        '感情が渦巻く+発散のパターン'
      ],
      behavioralStyles: [
        '段取りとインスピレーションの使い分け',
        '議論とムード作りの両方が得意',
        '問題点指摘+感性的解決提案',
        '「つまり」+「なんとなく」の混用'
      ],
      stressResponses: [
        '左右両側に症状が現れることがある',
        '論理と感性の板挟み',
        '議論と表現の両方で発散',
        '捻れの方向が定まらない'
      ]
    },
    responsePatterns: [
      {
        questionId: 10,
        mostLikelyChoice: 2, // "どちらでもない・意識しない"
        alternativeChoices: [],
        reasoning: '7種と8種の境界で腕組みパターンが不定',
        confidence: 7
      },
      {
        questionId: 12,
        mostLikelyChoice: 0, // "まず問題点や課題から話し始める"
        alternativeChoices: [1], // "「なんとなく」「感じとして」から話し始める"
        reasoning: '論理先行だが感性も重要な境界例',
        confidence: 6
      }
    ]
  }
];

// 全ペルソナを統合したエクスポート
export const allExtendedPersonas = [
  ...extendedPersonas,
  ...extendedPersonaVariations,
  ...boundaryPersonas
];