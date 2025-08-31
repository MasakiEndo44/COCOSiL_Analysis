// 体癖診断20問システム - 野口整体理論に基づく
import type { TaihekiType, TaihekiQuestion } from '@/types';

export const taihekiQuestions: TaihekiQuestion[] = [
  {
    id: 1,
    question: "人と会話をするとき、どのような態度を取りますか？",
    choices: [
      { text: "相手の目をじっと見て話す", taihekiType: 1, weight: 2 },
      { text: "身振り手振りを交えて表現豊かに話す", taihekiType: 2, weight: 2 },
      { text: "論理的に順序立てて説明する", taihekiType: 3, weight: 2 },
      { text: "相手の気持ちを察しながら優しく話す", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 2,
    question: "ストレスを感じるときの身体の反応は？",
    choices: [
      { text: "首や肩が緊張して硬くなる", taihekiType: 1, weight: 2 },
      { text: "呼吸が浅くなり、胸が苦しくなる", taihekiType: 2, weight: 2 },
      { text: "消化器系（胃腸）に症状が現れる", taihekiType: 3, weight: 2 },
      { text: "腰部や泌尿器系に違和感を覚える", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 3,
    question: "新しいことを学ぶとき、どのようなアプローチを取りますか？",
    choices: [
      { text: "まず全体像を把握してから詳細を理解する", taihekiType: 1, weight: 2 },
      { text: "実際に体験しながら覚えていく", taihekiType: 2, weight: 2 },
      { text: "理論や原理を理解してから実践する", taihekiType: 3, weight: 2 },
      { text: "他人から教えてもらいながら覚える", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 4,
    question: "怒りを表現するとき、どのような反応をしますか？",
    choices: [
      { text: "はっきりと意見を述べ、相手と向き合う", taihekiType: 1, weight: 2 },
      { text: "感情的に反応し、身体で表現する", taihekiType: 2, weight: 2 },
      { text: "冷静に分析し、論理的に反論する", taihekiType: 3, weight: 2 },
      { text: "内に秘めて、表面的には穏やかに対応する", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 5,
    question: "集中して作業をするとき、どのような環境を好みますか？",
    choices: [
      { text: "静かで整理整頓された空間", taihekiType: 1, weight: 2 },
      { text: "開放的で動きやすい空間", taihekiType: 2, weight: 2 },
      { text: "必要な資料や道具が揃った機能的な空間", taihekiType: 3, weight: 2 },
      { text: "リラックスできる居心地の良い空間", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 6,
    question: "疲労を感じたとき、どのような回復方法を選びますか？",
    choices: [
      { text: "しっかりと睡眠を取る", taihekiType: 1, weight: 2 },
      { text: "身体を動かして汗をかく", taihekiType: 2, weight: 2 },
      { text: "頭を使わない単純作業で休む", taihekiType: 3, weight: 2 },
      { text: "人と話したり、癒やし系の活動をする", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 7,
    question: "人間関係において重視することは？",
    choices: [
      { text: "相互の尊重と信頼関係", taihekiType: 1, weight: 2 },
      { text: "楽しさと活気のある関係", taihekiType: 2, weight: 2 },
      { text: "効率的で建設的な関係", taihekiType: 3, weight: 2 },
      { text: "温かく支え合える関係", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 8,
    question: "食べ物の好みについて最も当てはまるのは？",
    choices: [
      { text: "シンプルで上品な味付けを好む", taihekiType: 1, weight: 2 },
      { text: "香辛料の効いた刺激的な味を好む", taihekiType: 2, weight: 2 },
      { text: "栄養バランスを考えて食べる", taihekiType: 3, weight: 2 },
      { text: "甘いものや優しい味付けを好む", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 9,
    question: "判断を下すとき、最も重視するのは？",
    choices: [
      { text: "自分の信念や価値観", taihekiType: 1, weight: 2 },
      { text: "直感やひらめき", taihekiType: 2, weight: 2 },
      { text: "論理的思考と客観的事実", taihekiType: 3, weight: 2 },
      { text: "周囲との調和や相手の気持ち", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 10,
    question: "身体の動きや姿勢について、どれが最も当てはまりますか？",
    choices: [
      { text: "背筋を伸ばし、きちんとした姿勢を保つ", taihekiType: 1, weight: 2 },
      { text: "身振り手振りが大きく、動作が活発", taihekiType: 2, weight: 2 },
      { text: "効率的で無駄のない動作を心がける", taihekiType: 3, weight: 2 },
      { text: "ゆったりとした柔らかい動作", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 11,
    question: "睡眠パターンについて最も当てはまるのは？",
    choices: [
      { text: "早寝早起きで規則正しい睡眠", taihekiType: 1, weight: 2 },
      { text: "短時間でも深く眠れる", taihekiType: 2, weight: 2 },
      { text: "頭が冴えて夜型になりがち", taihekiType: 3, weight: 2 },
      { text: "長時間眠り、起きるのが苦手", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 12,
    question: "困難な状況に直面したとき、どのような反応をしますか？",
    choices: [
      { text: "正面から立ち向かい、解決しようとする", taihekiType: 1, weight: 2 },
      { text: "直感を頼りに、行動で突破しようとする", taihekiType: 2, weight: 2 },
      { text: "冷静に分析し、戦略を立てる", taihekiType: 3, weight: 2 },
      { text: "周囲に相談し、協力を求める", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 13,
    question: "創造性を発揮するとき、どのような特徴がありますか？",
    choices: [
      { text: "独創的で他人には思いつかないアイデア", taihekiType: 1, weight: 2 },
      { text: "インスピレーションから生まれる芸術的表現", taihekiType: 2, weight: 2 },
      { text: "論理的思考に基づく革新的なシステム", taihekiType: 3, weight: 2 },
      { text: "人の心に響く温かみのあるアイデア", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 14,
    question: "コミュニケーションスタイルについて最も当てはまるのは？",
    choices: [
      { text: "簡潔で要点を押さえた話し方", taihekiType: 1, weight: 2 },
      { text: "表情豊かで身振り手振りを交えて話す", taihekiType: 2, weight: 2 },
      { text: "詳細な説明と根拠を示して話す", taihekiType: 3, weight: 2 },
      { text: "相手の立場に立って優しく話す", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 15,
    question: "健康管理について、どのような意識を持っていますか？",
    choices: [
      { text: "規則正しい生活習慣を重視", taihekiType: 1, weight: 2 },
      { text: "身体を動かすことで健康を保つ", taihekiType: 2, weight: 2 },
      { text: "科学的根拠に基づいて管理", taihekiType: 3, weight: 2 },
      { text: "心身のバランスを大切にする", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 16,
    question: "時間管理について最も当てはまるのは？",
    choices: [
      { text: "几帳面で時間をしっかり守る", taihekiType: 1, weight: 2 },
      { text: "その場の状況に応じて柔軟に対応", taihekiType: 2, weight: 2 },
      { text: "効率を重視してスケジュールを組む", taihekiType: 3, weight: 2 },
      { text: "ゆとりを持った余裕のある計画", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 17,
    question: "リーダーシップを発揮するとき、どのようなスタイルですか？",
    choices: [
      { text: "理念を掲げて率先垂範で導く", taihekiType: 1, weight: 2 },
      { text: "エネルギッシュに引っ張っていく", taihekiType: 2, weight: 2 },
      { text: "戦略的に計画を立てて指揮する", taihekiType: 3, weight: 2 },
      { text: "メンバーの気持ちを大切にして支援する", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 18,
    question: "ストレス解消法として効果的なのは？",
    choices: [
      { text: "一人の時間を持って内省する", taihekiType: 1, weight: 2 },
      { text: "汗をかくような運動をする", taihekiType: 2, weight: 2 },
      { text: "読書や勉強で知的活動に没頭", taihekiType: 3, weight: 2 },
      { text: "人とおしゃべりして気分転換", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 19,
    question: "変化に対する反応はどのような傾向がありますか？",
    choices: [
      { text: "慎重に検討してから対応する", taihekiType: 1, weight: 2 },
      { text: "直感的に行動で対応する", taihekiType: 2, weight: 2 },
      { text: "分析して最適解を見つける", taihekiType: 3, weight: 2 },
      { text: "周囲の様子を見てから対応する", taihekiType: 4, weight: 2 }
    ]
  },
  {
    id: 20,
    question: "達成感を最も感じるのはどのような瞬間ですか？",
    choices: [
      { text: "自分の信念を貫き通したとき", taihekiType: 1, weight: 2 },
      { text: "身体全体でやり切った感覚があるとき", taihekiType: 2, weight: 2 },
      { text: "完璧な計画が成功したとき", taihekiType: 3, weight: 2 },
      { text: "皆が喜んでくれたとき", taihekiType: 4, weight: 2 }
    ]
  }
];

// 体癖算出ロジック
export function calculateTaiheki(answers: number[]): {
  primary: TaihekiType;
  secondary: TaihekiType;
  scores: Record<TaihekiType, number>;
  characteristics: string[];
  recommendations: string[];
} {
  // 各体癖のスコアを計算
  const scores: Record<TaihekiType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0
  };

  answers.forEach((answerIndex, questionIndex) => {
    const question = taihekiQuestions[questionIndex];
    const choice = question.choices[answerIndex];
    if (choice) {
      scores[choice.taihekiType] += choice.weight;
    }
  });

  // 上位2つを選出（主体癖・副体癖）
  const sortedTypes = (Object.keys(scores) as unknown as TaihekiType[])
    .sort((a, b) => scores[b] - scores[a]);

  const primary = sortedTypes[0];
  const secondary = sortedTypes[1];

  // 特徴と推奨事項を取得
  const characteristics = getTaihekiCharacteristics(primary);
  const recommendations = getTaihekiRecommendations(primary, secondary);

  return {
    primary,
    secondary,
    scores,
    characteristics,
    recommendations
  };
}

// 体癖特徴データ
function getTaihekiCharacteristics(type: TaihekiType): string[] {
  const characteristics = {
    1: [
      "頭脳明晰で論理的思考が得意",
      "責任感が強く、リーダーシップを発揮",
      "完璧主義的傾向がある",
      "独立心が強い",
      "首筋・肩が緊張しやすい"
    ],
    2: [
      "感情表現が豊かで芸術性に優れる",
      "直感力が鋭い",
      "身体感覚に敏感",
      "創造性が高い",
      "胸部・呼吸器系に症状が出やすい"
    ],
    3: [
      "分析力に優れ、計画性がある",
      "効率性を重視する",
      "知的好奇心が旺盛",
      "客観的判断が得意",
      "消化器系に影響が出やすい"
    ],
    4: [
      "協調性があり、人との調和を重視",
      "感受性が豊か",
      "優しさと思いやりがある",
      "人を支援することが得意",
      "泌尿器系・腰部に症状が出やすい"
    ],
    5: [
      "エネルギッシュで行動力がある",
      "新しいことへの挑戦を好む",
      "リーダーシップを発揮する",
      "目標達成への意欲が強い",
      "心臓・循環器系に負担がかかりやすい"
    ],
    6: [
      "慎重で思慮深い",
      "安定性を重視する",
      "忍耐力がある",
      "堅実な判断力",
      "腎臓・副腎系に影響しやすい"
    ],
    7: [
      "感情が豊かで表現力がある",
      "人との絆を大切にする",
      "直感的な判断が得意",
      "芸術的センスがある",
      "生殖器系・ホルモン系に影響しやすい"
    ],
    8: [
      "粘り強く持続力がある",
      "地道な努力を続けられる",
      "現実的で実用的",
      "信頼性が高い",
      "筋肉系・運動器系に症状が出やすい"
    ],
    9: [
      "バランス感覚に優れる",
      "調整能力が高い",
      "客観的な視点を持つ",
      "中庸な判断ができる",
      "自律神経系に影響が出やすい"
    ],
    10: [
      "独創性があり、ユニークな発想",
      "自由な発想と行動",
      "型にはまらない生き方",
      "個性的で特異な才能",
      "全身のバランスが不安定になりやすい"
    ]
  };

  return characteristics[type] || [];
}

function getTaihekiRecommendations(primary: TaihekiType, secondary: TaihekiType): string[] {
  const recommendations = {
    1: [
      "首・肩のマッサージやストレッチを定期的に行う",
      "完璧主義にならず、適度な妥協も大切",
      "瞑想や呼吸法でリラックス時間を作る",
      "信頼できる人に悩みを相談する"
    ],
    2: [
      "深呼吸や有酸素運動で呼吸器を強化",
      "感情表現の場を積極的に作る",
      "芸術活動で創造性を発揮する",
      "胸を開く姿勢を意識する"
    ],
    3: [
      "消化に良い食事と規則正しい食生活",
      "考えすぎず、適度な休息を取る",
      "腹部のマッサージやヨガを取り入れる",
      "頭脳労働の合間に軽い運動を"
    ],
    4: [
      "腰部の冷えを避け、温める工夫を",
      "人助けも大切だが、自分も大切にする",
      "水分補給を適切に行う",
      "ストレスは早めに発散する"
    ],
    5: [
      "適度な運動で心臓機能を維持",
      "目標設定は現実的に",
      "興奮しすぎず、冷静さを保つ",
      "血圧管理に注意"
    ],
    6: [
      "腎臓に負担をかけない生活習慣",
      "慎重すぎず、時には勇気ある行動を",
      "塩分控えめの食事",
      "適度な水分摂取"
    ],
    7: [
      "ホルモンバランスに注意した生活",
      "感情を適切に表現する場を持つ",
      "生殖機能に配慮した健康管理",
      "ストレスを溜めない工夫"
    ],
    8: [
      "筋肉疲労を適切にケアする",
      "無理をせず、体調管理を優先",
      "マッサージやストレッチを習慣化",
      "持続可能なペースで活動"
    ],
    9: [
      "自律神経を整える規則正しい生活",
      "バランスの取れた食事",
      "適度な運動と十分な休息",
      "ストレス管理を徹底"
    ],
    10: [
      "全身のバランスを整える運動",
      "個性を活かせる環境を選ぶ",
      "型にはまりすぎず、自由度を保つ",
      "定期的な健康チェック"
    ]
  };

  const primaryRec = recommendations[primary] || [];
  const secondaryRec = recommendations[secondary] || [];
  
  // 主体癖の推奨事項をメインに、副体癖から補完
  return [...primaryRec, ...secondaryRec.slice(0, 2)];
}