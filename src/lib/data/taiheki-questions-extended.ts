// 体癖診断30問システム - 1-10種完全対応版
// 野口整体理論に基づく5軸判別システム
import type { TaihekiType, TaihekiQuestion } from '@/types';

// 拡張された質問インターフェース
interface ExtendedTaihekiQuestion extends TaihekiQuestion {
  category: '上下' | '左右' | '前後' | '捻れ' | '開閉';
  discriminationTarget: TaihekiType[]; // この質問で主に判別したい型
}

export const extendedTaihekiQuestions: ExtendedTaihekiQuestion[] = [
  // 上下型判別 (1種・2種)
  {
    id: 1,
    category: '上下',
    discriminationTarget: [1, 2],
    question: "人と会話をするとき、どのような態度を取りますか？",
    choices: [
      { text: "相手の目をじっと見て論理的に話す", taihekiType: 1, weight: 3 },
      { text: "身振り手振りを交えて表現豊かに話す", taihekiType: 2, weight: 3 },
      { text: "相手の反応を見ながら段階的に説明する", taihekiType: 3, weight: 1 },
      { text: "相手の気持ちを察しながら優しく話す", taihekiType: 4, weight: 1 }
    ]
  },
  {
    id: 2,
    category: '上下',
    discriminationTarget: [1, 2],
    question: "ストレスを感じるときの身体の反応は？",
    choices: [
      { text: "首や肩が緊張して硬くなる", taihekiType: 1, weight: 3 },
      { text: "呼吸が浅くなり、胸が苦しくなる", taihekiType: 2, weight: 3 },
      { text: "消化器系（胃腸）に症状が現れる", taihekiType: 3, weight: 1 },
      { text: "腰部や下半身に違和感を覚える", taihekiType: 4, weight: 1 }
    ]
  },
  {
    id: 3,
    category: '上下',
    discriminationTarget: [1, 2],
    question: "感情表現について最も当てはまるのは？",
    choices: [
      { text: "論理的に説明して理解を求める", taihekiType: 1, weight: 3 },
      { text: "表情や身体で豊かに表現する", taihekiType: 2, weight: 3 },
      { text: "客観的に分析して説明する", taihekiType: 3, weight: 1 },
      { text: "相手に配慮して控えめに表現する", taihekiType: 4, weight: 1 }
    ]
  },

  // 左右型判別 (3種・4種)
  {
    id: 4,
    category: '左右',
    discriminationTarget: [3, 4],
    question: "新しいことを学ぶとき、どのようなアプローチを取りますか？",
    choices: [
      { text: "まず全体像を把握してから詳細を理解する", taihekiType: 1, weight: 1 },
      { text: "実際に体験しながら感覚的に覚える", taihekiType: 2, weight: 1 },
      { text: "理論や原理を理解してから実践する", taihekiType: 3, weight: 3 },
      { text: "他人から教えてもらいながら覚える", taihekiType: 4, weight: 3 }
    ]
  },
  {
    id: 5,
    category: '左右',
    discriminationTarget: [3, 4],
    question: "意見が対立したとき、どのような反応をしますか？",
    choices: [
      { text: "はっきりと自分の意見を述べる", taihekiType: 1, weight: 1 },
      { text: "感情的に反応し、身体で表現する", taihekiType: 2, weight: 1 },
      { text: "冷静に分析し、論理的に反論する", taihekiType: 3, weight: 3 },
      { text: "内に秘めて、表面的には穏やかに対応する", taihekiType: 4, weight: 3 }
    ]
  },
  {
    id: 6,
    category: '左右',
    discriminationTarget: [3, 4],
    question: "集中して作業をするとき、どのような環境を好みますか？",
    choices: [
      { text: "静かで整理された空間", taihekiType: 1, weight: 1 },
      { text: "開放的で動きやすい空間", taihekiType: 2, weight: 1 },
      { text: "必要な資料や道具が揃った機能的な空間", taihekiType: 3, weight: 3 },
      { text: "リラックスできる居心地の良い空間", taihekiType: 4, weight: 3 }
    ]
  },

  // 前後型判別 (5種・6種)
  {
    id: 7,
    category: '前後',
    discriminationTarget: [5, 6],
    question: "行動を起こすとき、どのようなパターンですか？",
    choices: [
      { text: "積極的にすぐ行動に移す", taihekiType: 5, weight: 3 },
      { text: "慎重に考えてから行動する", taihekiType: 6, weight: 3 },
      { text: "創造的なアプローチで行動", taihekiType: 7, weight: 1 },
      { text: "周囲と調和を取りながら行動", taihekiType: 8, weight: 1 }
    ]
  },
  {
    id: 8,
    category: '前後',
    discriminationTarget: [5, 6],
    question: "身体の姿勢や動作について最も当てはまるのは？",
    choices: [
      { text: "胸を張って肩幅の広いV字型体型", taihekiType: 5, weight: 3 },
      { text: "顎を突き出し、前屈みになりがち", taihekiType: 6, weight: 3 },
      { text: "左肩が前に出やすい", taihekiType: 7, weight: 1 },
      { text: "右肩が前に出やすい", taihekiType: 8, weight: 1 }
    ]
  },
  {
    id: 9,
    category: '前後',
    discriminationTarget: [5, 6],
    question: "エネルギーの使い方について最も当てはまるのは？",
    choices: [
      { text: "行動しながら考え、複数のことを同時に進める", taihekiType: 5, weight: 3 },
      { text: "言葉や理想で情熱を燃やし、夜型になりがち", taihekiType: 6, weight: 3 },
      { text: "論理的に段取りを組んで効率的に進める", taihekiType: 7, weight: 1 },
      { text: "直感的にインスピレーションで進める", taihekiType: 8, weight: 1 }
    ]
  },

  // 捻れ型判別 (7種・8種)
  {
    id: 10,
    category: '捻れ',
    discriminationTarget: [7, 8],
    question: "腕を組むとき、どちらの腕が自然に上になりますか？",
    choices: [
      { text: "左腕が上になる", taihekiType: 7, weight: 3 },
      { text: "右腕が上になる", taihekiType: 8, weight: 3 },
      { text: "どちらでもない・意識しない", taihekiType: 5, weight: 1 },
      { text: "腕組みをしない", taihekiType: 6, weight: 1 }
    ]
  },
  {
    id: 11,
    category: '捻れ',
    discriminationTarget: [7, 8],
    question: "立っているときの足の位置はどうなりがちですか？",
    choices: [
      { text: "左足が半歩前に出る", taihekiType: 7, weight: 3 },
      { text: "右足が半歩前に出る", taihekiType: 8, weight: 3 },
      { text: "両足を肩幅に開いて立つ", taihekiType: 9, weight: 1 },
      { text: "両足を揃えて立つ", taihekiType: 10, weight: 1 }
    ]
  },
  {
    id: 12,
    category: '捻れ',
    discriminationTarget: [7, 8],
    question: "アイデアや意見を説明するとき、どのような特徴がありますか？",
    choices: [
      { text: "まず問題点や課題から話し始める", taihekiType: 7, weight: 3 },
      { text: "「なんとなく」「感じとして」から話し始める", taihekiType: 8, weight: 3 },
      { text: "「つまり」「要するに」で要点をまとめる", taihekiType: 7, weight: 2 },
      { text: "「たとえば」「なんか」で具体例から入る", taihekiType: 8, weight: 2 }
    ]
  },

  // 開閉型判別 (9種・10種)
  {
    id: 13,
    category: '開閉',
    discriminationTarget: [9, 10],
    question: "深呼吸をしたときの身体の反応は？",
    choices: [
      { text: "胸が縦にも横にもよく膨らむ", taihekiType: 9, weight: 3 },
      { text: "みぞおち以下がギュッと締まる感覚", taihekiType: 10, weight: 3 },
      { text: "肩や首が上がる", taihekiType: 1, weight: 1 },
      { text: "胸部が横に広がる", taihekiType: 2, weight: 1 }
    ]
  },
  {
    id: 14,
    category: '開閉',
    discriminationTarget: [9, 10],
    question: "「制限なく何でもできるとしたら？」という質問にどう答えますか？",
    choices: [
      { text: "即座に壮大な理想や夢を語る", taihekiType: 9, weight: 3 },
      { text: "まずリスクや実現可能性を考える", taihekiType: 10, weight: 3 },
      { text: "論理的に可能性を分析する", taihekiType: 3, weight: 1 },
      { text: "周囲への影響を考慮する", taihekiType: 4, weight: 1 }
    ]
  },
  {
    id: 15,
    category: '開閉',
    discriminationTarget: [9, 10],
    question: "気分の変動パターンについて最も当てはまるのは？",
    choices: [
      { text: "一気に膨らみ、一気にしぼむ", taihekiType: 9, weight: 3 },
      { text: "内向きに収縮し、じっくり溜め込む", taihekiType: 10, weight: 3 },
      { text: "渦巻くように高まり発散する", taihekiType: 7, weight: 1 },
      { text: "感情が顔や身体に現れやすい", taihekiType: 8, weight: 1 }
    ]
  },

  // 複合判別質問（判別困難な組み合わせ対応）
  {
    id: 16,
    category: '上下',
    discriminationTarget: [1, 3],
    question: "論理的思考を働かせるとき、どのような特徴がありますか？",
    choices: [
      { text: "原理原則を重視し、信念を貫く", taihekiType: 1, weight: 3 },
      { text: "データや事実を分析し、効率を追求する", taihekiType: 3, weight: 3 },
      { text: "直感を論理で後付けする", taihekiType: 2, weight: 1 },
      { text: "相手の立場を論理的に配慮する", taihekiType: 4, weight: 1 }
    ]
  },
  {
    id: 17,
    category: '上下',
    discriminationTarget: [2, 4],
    question: "感情的になったとき、どのような表現をしますか？",
    choices: [
      { text: "身体全体で豊かに表現する", taihekiType: 2, weight: 3 },
      { text: "内に秘めて、表面は穏やかに保つ", taihekiType: 4, weight: 3 },
      { text: "論理的に感情を説明する", taihekiType: 1, weight: 1 },
      { text: "客観的に感情を分析する", taihekiType: 3, weight: 1 }
    ]
  },
  {
    id: 18,
    category: '前後',
    discriminationTarget: [5, 7],
    question: "積極性を発揮するとき、どのような特徴がありますか？",
    choices: [
      { text: "行動力で人を引っ張っていく", taihekiType: 5, weight: 3 },
      { text: "批判的分析で議論をリードする", taihekiType: 7, weight: 3 },
      { text: "理想を掲げて率先垂範する", taihekiType: 1, weight: 1 },
      { text: "創造性で新しい道を示す", taihekiType: 2, weight: 1 }
    ]
  },
  {
    id: 19,
    category: '前後',
    discriminationTarget: [6, 8],
    question: "直感的な判断をするとき、どのような特徴がありますか？",
    choices: [
      { text: "理想への情熱で判断し、言葉で表現する", taihekiType: 6, weight: 3 },
      { text: "感性が先行し、後で言語化する", taihekiType: 8, weight: 3 },
      { text: "身体感覚で直感的に判断する", taihekiType: 2, weight: 1 },
      { text: "相手の気持ちを察して直感的に判断する", taihekiType: 4, weight: 1 }
    ]
  },
  {
    id: 20,
    category: '捻れ',
    discriminationTarget: [7, 8],
    question: "ストレスが溜まったとき、どのような発散方法を選びますか？",
    choices: [
      { text: "批判的な分析や議論で発散する", taihekiType: 7, weight: 3 },
      { text: "身振り手振りで表現しながら発散する", taihekiType: 8, weight: 3 },
      { text: "運動や行動で発散する", taihekiType: 5, weight: 1 },
      { text: "言葉や理想で発散する", taihekiType: 6, weight: 1 }
    ]
  },

  // 奇偶判別強化質問
  {
    id: 21,
    category: '前後',
    discriminationTarget: [5, 6, 7, 8, 9, 10],
    question: "エネルギーの使い方について最も当てはまるのは？",
    choices: [
      { text: "外に向かって発散することでバランスを取る", taihekiType: 5, weight: 2 },
      { text: "内に溜め込むことでバランスを取る", taihekiType: 6, weight: 2 },
      { text: "渦巻くように高めて発散する", taihekiType: 7, weight: 2 },
      { text: "感性で受け取り、後で表現する", taihekiType: 8, weight: 2 }
    ]
  },
  {
    id: 22,
    category: '開閉',
    discriminationTarget: [9, 10],
    question: "プレッシャーを感じるとき、どのような反応をしますか？",
    choices: [
      { text: "気分が乗ると過多活動、落ちると一気に停止", taihekiType: 9, weight: 3 },
      { text: "力が抜けると好調、プレッシャーに弱い", taihekiType: 10, weight: 3 },
      { text: "論理的に分析して対処する", taihekiType: 3, weight: 1 },
      { text: "感情的に反応する", taihekiType: 2, weight: 1 }
    ]
  },

  // 全体統合質問
  {
    id: 23,
    question: "自分の重心がある感覚の場所は？",
    choices: [
      { text: "頭部・首の辺り", taihekiType: 1, weight: 2 },
      { text: "胸部・心臓の辺り", taihekiType: 2, weight: 2 },
      { text: "腹部・胃の辺り", taihekiType: 3, weight: 2 },
      { text: "腰部・骨盤の辺り", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 24,
    question: "物事を説明するときの枕詞は？",
    choices: [
      { text: "「つまり」「要するに」", taihekiType: 7, weight: 2 },
      { text: "「なんか」「たとえば」", taihekiType: 8, weight: 2 },
      { text: "「もし」「もっと」", taihekiType: 9, weight: 2 },
      { text: "「でも」「まず」", taihekiType: 10, weight: 2 }
    ]
  },
  {
    id: 25,
    question: "座っているときの自然な姿勢は？",
    choices: [
      { text: "背筋を伸ばし、きちんとした姿勢", taihekiType: 1, weight: 2 },
      { text: "身振り手振りが大きく、動作が活発", taihekiType: 2, weight: 2 },
      { text: "脚を前へ投げ出しやすい", taihekiType: 9, weight: 2 },
      { text: "両足をそろえて座る", taihekiType: 10, weight: 2 }
    ]
  },

  // 境界ケース判別質問
  {
    id: 26,
    question: "疲労回復について最も効果的なのは？",
    choices: [
      { text: "しっかりと睡眠を取り、規則正しい生活", taihekiType: 1, weight: 2 },
      { text: "身体を動かして汗をかく", taihekiType: 5, weight: 2 },
      { text: "一人の時間で内省・瞑想", taihekiType: 6, weight: 2 },
      { text: "人と話して発散", taihekiType: 8, weight: 2 }
    ]
  },
  {
    id: 27,
    question: "創造性を発揮するとき、どのような特徴がありますか？",
    choices: [
      { text: "独創的で他人には思いつかないアイデア", taihekiType: 1, weight: 2 },
      { text: "インスピレーションから生まれる芸術的表現", taihekiType: 2, weight: 2 },
      { text: "規模感・将来像をまず描く", taihekiType: 9, weight: 2 },
      { text: "実行可能性・リスクを先に計算", taihekiType: 10, weight: 2 }
    ]
  },
  {
    id: 28,
    question: "リーダーシップスタイルについて最も当てはまるのは？",
    choices: [
      { text: "理念を掲げて率先垂範で導く", taihekiType: 1, weight: 2 },
      { text: "エネルギッシュに引っ張っていく", taihekiType: 5, weight: 2 },
      { text: "戦略的に計画を立てて指揮する", taihekiType: 3, weight: 2 },
      { text: "メンバーの気持ちを大切にして支援する", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 29,
    question: "変化に対する反応はどのような傾向がありますか？",
    choices: [
      { text: "慎重に検討してから対応する", taihekiType: 6, weight: 2 },
      { text: "直感的に行動で対応する", taihekiType: 8, weight: 2 },
      { text: "分析して最適解を見つける", taihekiType: 3, weight: 2 },
      { text: "周囲の様子を見てから対応する", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 30,
    question: "達成感を最も感じるのはどのような瞬間ですか？",
    choices: [
      { text: "自分の信念を貫き通したとき", taihekiType: 1, weight: 2 },
      { text: "身体全体でやり切った感覚があるとき", taihekiType: 5, weight: 2 },
      { text: "理想への情熱が実現したとき", taihekiType: 6, weight: 2 },
      { text: "創造的なアイデアが形になったとき", taihekiType: 7, weight: 2 }
    ]
  }
];

// 拡張された体癖算出ロジック
export function calculateExtendedTaiheki(answers: number[]): {
  primary: TaihekiType;
  secondary: TaihekiType;
  scores: Record<TaihekiType, number>;
  axisScores: Record<string, Record<TaihekiType, number>>;
  confidence: number;
  characteristics: string[];
  recommendations: string[];
} {
  // 各体癖のスコアを計算
  const scores: Record<TaihekiType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
  };

  // 軸別スコア計算
  const axisScores = {
    '上下': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 } as Record<TaihekiType, number>,
    '左右': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 } as Record<TaihekiType, number>,
    '前後': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 } as Record<TaihekiType, number>,
    '捻れ': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 } as Record<TaihekiType, number>,
    '開閉': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 } as Record<TaihekiType, number>
  };

  answers.forEach((answerIndex, questionIndex) => {
    const question = extendedTaihekiQuestions[questionIndex];
    const choice = question.choices[answerIndex];
    if (choice) {
      scores[choice.taihekiType] += choice.weight;
      
      // 軸別スコアも加算
      if (question.category) {
        axisScores[question.category][choice.taihekiType] += choice.weight;
      }
    }
  });

  // 奇偶バランス調整
  const oddTypes: TaihekiType[] = [1, 3, 5, 7, 9];
  const evenTypes: TaihekiType[] = [2, 4, 6, 8, 10];
  
  const oddTotal = oddTypes.reduce((sum, type) => sum + scores[type], 0);
  const evenTotal = evenTypes.reduce((sum, type) => sum + scores[type], 0);
  
  // バランス調整係数
  if (oddTotal > evenTotal * 1.5) {
    evenTypes.forEach(type => scores[type] *= 1.2);
  } else if (evenTotal > oddTotal * 1.5) {
    oddTypes.forEach(type => scores[type] *= 1.2);
  }

  // 軸別優勢度計算
  const axisMaxScores = {
    '上下': Math.max(axisScores['上下'][1], axisScores['上下'][2]),
    '左右': Math.max(axisScores['左右'][3], axisScores['左右'][4]),
    '前後': Math.max(axisScores['前後'][5], axisScores['前後'][6]),
    '捻れ': Math.max(axisScores['捻れ'][7], axisScores['捻れ'][8]),
    '開閉': Math.max(axisScores['開閉'][9], axisScores['開閉'][10])
  };

  // 上位2つを選出（主体癖・副体癖）
  const sortedTypes = (Object.keys(scores) as unknown as TaihekiType[])
    .sort((a, b) => scores[b] - scores[a]);

  const primary = sortedTypes[0];
  const secondary = sortedTypes[1];

  // 信頼度計算（1位と2位の差、軸別一貫性を考慮）
  const topScore = scores[primary];
  const secondScore = scores[secondary];
  const scoreDiff = topScore > 0 ? (topScore - secondScore) / topScore : 0;
  
  // 軸別一貫性チェック
  let axisConsistency = 0;
  const primaryAxis = getPrimaryAxis(primary);
  if (primaryAxis && axisMaxScores[primaryAxis] > 0) {
    axisConsistency = scores[primary] / axisMaxScores[primaryAxis];
  }
  
  const confidence = Math.min((scoreDiff * 0.7 + axisConsistency * 0.3) * 100, 100);

  // 特徴と推奨事項を取得
  const characteristics = getExtendedTaihekiCharacteristics(primary);
  const recommendations = getExtendedTaihekiRecommendations(primary, secondary);

  return {
    primary,
    secondary,
    scores,
    axisScores,
    confidence,
    characteristics,
    recommendations
  };
}

// 体癖の主軸を取得
function getPrimaryAxis(type: TaihekiType): string | null {
  const axisMap: Record<TaihekiType, string> = {
    1: '上下', 2: '上下',
    3: '左右', 4: '左右',
    5: '前後', 6: '前後',
    7: '捻れ', 8: '捻れ',
    9: '開閉', 10: '開閉'
  };
  return axisMap[type] || null;
}

// 拡張された体癖特徴データ（研究ベース）
function getExtendedTaihekiCharacteristics(type: TaihekiType): string[] {
  const characteristics = {
    1: [
      "論理的思考と原理原則を重視",
      "責任感が強く完璧主義的傾向",
      "背筋が伸び、首・肩に緊張が現れやすい",
      "独立心が強く、リーダーシップを発揮",
      "効率性と秩序を好む"
    ],
    2: [
      "感情表現が豊かで芸術性に優れる",
      "直感力と創造性が高い",
      "身振り手振りが大きく、表情豊か",
      "胸部・呼吸器系に症状が出やすい",
      "インスピレーションを大切にする"
    ],
    3: [
      "分析的思考と効率性を追求",
      "客観的判断と知的好奇心が旺盛",
      "機能的な動作と計画性",
      "消化器系に影響が出やすい",
      "データに基づく合理的判断"
    ],
    4: [
      "協調性と他者への思いやりが深い",
      "調和を重視し、感受性が豊か",
      "ゆったりとした柔らかい動作",
      "腰部・泌尿器系に症状が出やすい",
      "人を支援することが得意"
    ],
    5: [
      "行動的で積極的な合理主義者",
      "エネルギッシュでスポーツマンタイプ",
      "肩幅が広くV字型の胴体",
      "呼吸器が丈夫で上半身に汗をかきやすい",
      "動きながら考え、複数作業を同時進行"
    ],
    6: [
      "慎重で思慮深く、理想への情熱",
      "言葉でエネルギー発散、夜型傾向",
      "顎突き出し・前屈み姿勢",
      "呼吸器が弱く息切れしやすい",
      "プレッシャーに弱いが、力が抜けると好調"
    ],
    7: [
      "批判的・分析好みで論理→感性思考",
      "段取りが巧みで議論が得意",
      "左肩が前、右腰が前の捻れ",
      "左肋骨が開きやすく左腕組み",
      "問題点から話し始める傾向"
    ],
    8: [
      "直感・感性先行のムードメーカー",
      "インスピレーションで即行動",
      "右肩が前、左腰が前の捻れ",
      "身振りが大きく右手が先行",
      "「なんとなく」で説明を始める"
    ],
    9: [
      "拡大志向で理想・夢を語る",
      "大らかで人を巻き込む性格",
      "胸郭が大きく開き、縦長シルエット",
      "深呼吸で胸が縦横に膨らむ",
      "気分の乗降が激しい（膨張⇄収縮）"
    ],
    10: [
      "収縮志向で慎重・保守的",
      "コツコツ継続、安定性重視",
      "みぞおち以下を締め、丹田が強い",
      "前屈み傾向で握力が強い",
      "まずリスク・不安を考える"
    ]
  };

  return characteristics[type] || [];
}

function getExtendedTaihekiRecommendations(primary: TaihekiType, secondary: TaihekiType): string[] {
  const recommendations = {
    1: [
      "首・肩のマッサージやストレッチを定期的に",
      "完璧主義にならず、適度な妥協も大切",
      "瞑想や呼吸法でリラックス時間を作る"
    ],
    2: [
      "深呼吸や有酸素運動で呼吸器を強化",
      "感情表現の場を積極的に作る",
      "芸術活動で創造性を発揮する"
    ],
    3: [
      "消化に良い食事と規則正しい食生活",
      "考えすぎず、適度な休息を取る",
      "腹部のマッサージやヨガを取り入れる"
    ],
    4: [
      "腰部の冷えを避け、温める工夫を",
      "人助けも大切だが、自分も大切にする",
      "ストレスは早めに発散する"
    ],
    5: [
      "適度な運動で心臓機能を維持",
      "目標設定は現実的に",
      "興奮しすぎず、冷静さを保つ"
    ],
    6: [
      "理想と現実のバランスを取る",
      "夜型を活かしつつ、体調管理に注意",
      "プレッシャーを感じたら力を抜く"
    ],
    7: [
      "批判だけでなく建設的提案も心がける",
      "左側の身体のケアを重視",
      "論理と感性のバランスを保つ"
    ],
    8: [
      "直感を大切にしつつ、検証も行う",
      "右側の身体のケアを重視",
      "感性を活かせる環境を選ぶ"
    ],
    9: [
      "理想と現実のギャップに注意",
      "拡大しすぎず、適度な制限も必要",
      "胸を開く姿勢と深呼吸を習慣に"
    ],
    10: [
      "慎重さを活かしつつ、時には冒険も",
      "下半身を温め、丹田を意識",
      "継続力を活かした長期的取り組み"
    ]
  };

  const primaryRec = recommendations[primary] || [];
  const secondaryRec = recommendations[secondary] || [];
  
  return [...primaryRec, ...secondaryRec.slice(0, 2)];
}