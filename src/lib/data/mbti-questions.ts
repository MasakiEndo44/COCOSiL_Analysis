// MBTI 12問診断 - 簡易版（4軸×3問）
export interface MBTIQuestion {
  id: number;
  question: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  choices: {
    text: string;
    type: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
    weight: number;
  }[];
}

export const mbtiQuestions: MBTIQuestion[] = [
  // E/I軸 (外向/内向) - 3問
  {
    id: 1,
    question: "新しい環境で知らない人たちと過ごすとき、あなたは？",
    axis: "EI",
    choices: [
      {
        text: "積極的に話しかけて、多くの人とコミュニケーションを取る",
        type: "E",
        weight: 2
      },
      {
        text: "一人か少数の人とじっくり話す方を好む",
        type: "I",
        weight: 2
      }
    ]
  },
  {
    id: 2,
    question: "エネルギーを回復するために必要なのは？",
    axis: "EI",
    choices: [
      {
        text: "友人や同僚と活動的に過ごす時間",
        type: "E",
        weight: 2
      },
      {
        text: "一人でリラックスできる静かな時間",
        type: "I",
        weight: 2
      }
    ]
  },
  {
    id: 3,
    question: "問題を解決するとき、あなたは？",
    axis: "EI",
    choices: [
      {
        text: "他の人と話し合いながら解決策を見つける",
        type: "E",
        weight: 2
      },
      {
        text: "まず一人でじっくり考えてから行動する",
        type: "I",
        weight: 2
      }
    ]
  },

  // S/N軸 (感覚/直感) - 3問
  {
    id: 4,
    question: "情報を理解するとき、重視するのは？",
    axis: "SN",
    choices: [
      {
        text: "具体的な事実やデータ、実践的な例",
        type: "S",
        weight: 2
      },
      {
        text: "全体像やパターン、可能性や意味",
        type: "N",
        weight: 2
      }
    ]
  },
  {
    id: 5,
    question: "新しいプロジェクトに取り組むとき？",
    axis: "SN",
    choices: [
      {
        text: "詳細な計画を立てて、段階的に進める",
        type: "S",
        weight: 2
      },
      {
        text: "大枠を決めて、創造的にアプローチする",
        type: "N",
        weight: 2
      }
    ]
  },
  {
    id: 6,
    question: "学習スタイルとして好むのは？",
    axis: "SN",
    choices: [
      {
        text: "実際の経験や具体例を通じて学ぶ",
        type: "S",
        weight: 2
      },
      {
        text: "理論や概念を理解してから応用する",
        type: "N",
        weight: 2
      }
    ]
  },

  // T/F軸 (思考/感情) - 3問
  {
    id: 7,
    question: "重要な決定を下すとき、最も重視するのは？",
    axis: "TF",
    choices: [
      {
        text: "論理的な分析と客観的な基準",
        type: "T",
        weight: 2
      },
      {
        text: "関係者の気持ちと価値観への配慮",
        type: "F",
        weight: 2
      }
    ]
  },
  {
    id: 8,
    question: "他人を評価するとき、重要視するのは？",
    axis: "TF",
    choices: [
      {
        text: "能力と成果、論理的な思考力",
        type: "T",
        weight: 2
      },
      {
        text: "人柄と協調性、思いやりの心",
        type: "F",
        weight: 2
      }
    ]
  },
  {
    id: 9,
    question: "批判やフィードバックを受けるとき？",
    axis: "TF",
    choices: [
      {
        text: "内容を客観的に分析して改善点を見つける",
        type: "T",
        weight: 2
      },
      {
        text: "相手の気持ちや関係性も含めて考慮する",
        type: "F",
        weight: 2
      }
    ]
  },

  // J/P軸 (判断/知覚) - 3問
  {
    id: 10,
    question: "日常生活において好むスタイルは？",
    axis: "JP",
    choices: [
      {
        text: "計画的で規則正しい、構造化された生活",
        type: "J",
        weight: 2
      },
      {
        text: "柔軟で自由な、状況に応じて変化する生活",
        type: "P",
        weight: 2
      }
    ]
  },
  {
    id: 11,
    question: "締切があるタスクに対して？",
    axis: "JP",
    choices: [
      {
        text: "早めに取り掛かって、余裕をもって完成させる",
        type: "J",
        weight: 2
      },
      {
        text: "締切が近づいてから集中して取り組む",
        type: "P",
        weight: 2
      }
    ]
  },
  {
    id: 12,
    question: "旅行の計画を立てるとき？",
    axis: "JP",
    choices: [
      {
        text: "詳細なスケジュールを事前に決めておく",
        type: "J",
        weight: 2
      },
      {
        text: "大まかな方向性だけ決めて、現地で自由に行動する",
        type: "P",
        weight: 2
      }
    ]
  }
];

// MBTI結果算出ロジック
export function calculateMBTI(answers: (0 | 1)[]): {
  type: string;
  scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  confidence: number;
} {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0, 
    T: 0, F: 0,
    J: 0, P: 0
  };

  // 回答を集計
  answers.forEach((answer, index) => {
    const question = mbtiQuestions[index];
    const choice = question.choices[answer];
    scores[choice.type] += choice.weight;
  });

  // タイプを決定
  const type = 
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P');

  // 信頼度計算（各軸の差の合計を基に）
  const axisDifferences = [
    Math.abs(scores.E - scores.I),
    Math.abs(scores.S - scores.N),
    Math.abs(scores.T - scores.F),
    Math.abs(scores.J - scores.P)
  ];
  
  const maxPossibleDifference = 6; // 各軸3問×2点
  const confidence = axisDifferences.reduce((acc, diff) => acc + diff, 0) / (4 * maxPossibleDifference);

  return {
    type,
    scores,
    confidence: Math.min(confidence, 1.0)
  };
}

// MBTIタイプの説明
export const mbtiDescriptions = {
  'INTJ': {
    name: '建築家',
    description: '創造的で戦略的思考を持つ完璧主義者',
    traits: ['独立的', '革新的', '戦略的', '完璧主義'],
  },
  'INTP': {
    name: '論理学者',
    description: '知識への渇望と独創的なアイデアを持つ思想家',
    traits: ['分析的', '独創的', '理論的', '客観的'],
  },
  'ENTJ': {
    name: '指揮官',
    description: '大胆で想像力豊かな強力なリーダー',
    traits: ['リーダーシップ', '戦略的', '効率的', '決断力'],
  },
  'ENTP': {
    name: '討論者',
    description: '賢くて好奇心旺盛な思想家、知的挑戦を愛する',
    traits: ['革新的', 'エネルギッシュ', '創造的', '多才'],
  },
  'INFJ': {
    name: '提唱者',
    description: '静かで神秘的だが、人々を非常に勇気づける理想主義者',
    traits: ['理想主義', '共感的', '創造的', '献身的'],
  },
  'INFP': {
    name: '仲介者',
    description: '詩的で親切で利他的、常により良い大義のために熱心',
    traits: ['理想主義', '柔軟性', '共感的', '好奇心旺盛'],
  },
  'ENFJ': {
    name: '主人公',
    description: 'カリスマ性があり人々を奮い立たせるリーダー',
    traits: ['カリスマ的', '利他的', '感受性豊か', '自然なリーダー'],
  },
  'ENFP': {
    name: '運動家',
    description: '熱狂的で創造的で社交的な自由人',
    traits: ['熱狂的', '創造的', '社交的', '自由奔放'],
  },
  'ISTJ': {
    name: '管理者',
    description: '現実的で責任感が強い、信頼できる働き者',
    traits: ['責任感', '実用的', '規律正しい', '献身的'],
  },
  'ISFJ': {
    name: '擁護者',
    description: '非常に献身的で温かい守護者、愛する人を守る準備ができている',
    traits: ['守護的', '思いやりがある', '献身的', '責任感'],
  },
  'ESTJ': {
    name: '幹部',
    description: '優秀な管理者、物事や人々を管理する才能がある',
    traits: ['組織的', '実用的', '論理的', 'リーダーシップ'],
  },
  'ESFJ': {
    name: '領事',
    description: '非常に思いやりがあり社交的で人気者',
    traits: ['協力的', '思いやりがある', '人気者', '献身的'],
  },
  'ISTP': {
    name: '巨匠',
    description: '大胆で実践的な実験者、あらゆる種類の道具を使いこなす',
    traits: ['実践的', '現実的', '論理的', '柔軟性'],
  },
  'ISFP': {
    name: '冒険家',
    description: '柔軟性があり魅力的なアーティスト、新しい可能性を探求する準備ができている',
    traits: ['柔軟性', '魅力的', '芸術的', '思いやりがある'],
  },
  'ESTP': {
    name: '起業家',
    description: '賢くてエネルギッシュで知覚が鋭い人、真に人生を楽しんでいる',
    traits: ['エネルギッシュ', '知覚的', '自発的', '実践的'],
  },
  'ESFP': {
    name: 'エンターテイナー',
    description: '自発的でエネルギッシュで熱狂的な人、人生は退屈にならない',
    traits: ['自発的', 'エネルギッシュ', '熱狂的', '人懐っこい'],
  }
} as const;