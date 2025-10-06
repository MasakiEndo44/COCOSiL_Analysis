/**
 * 体癖タイプ比較データ
 *
 * 10種類の体癖タイプを比較するための簡潔なデータ構造。
 * 「10種の違い」を視覚的に理解するために使用。
 */

export interface TaihekiTypeComparison {
  type: number;
  name: string;
  category: '上下型' | '前後型' | '左右型';
  subcategory: string;
  emoji: string;
  keyTraits: string[];
  thinkingStyle: string;
  actionStyle: string;
  communication: string;
  shortDescription: string;
}

export const TAIHEKI_COMPARISON_DATA: Record<number, TaihekiTypeComparison> = {
  1: {
    type: 1,
    name: '1種（上下型）',
    category: '上下型',
    subcategory: '頭脳・意志型',
    emoji: '🧠',
    keyTraits: ['論理的', '計画的', '冷静'],
    thinkingStyle: '頭で考えてから行動',
    actionStyle: '計画的・着実',
    communication: '論理的説明を好む',
    shortDescription: '目標達成能力が高く、客観的な判断ができる',
  },
  2: {
    type: 2,
    name: '2種（前後型）',
    category: '前後型',
    subcategory: '消化器型',
    emoji: '🍽️',
    keyTraits: ['好き嫌い明確', '実践的', '現実的'],
    thinkingStyle: '好き嫌いで判断',
    actionStyle: '実利重視',
    communication: '直接的・率直',
    shortDescription: '情報の取捨選択が得意で、実践的な判断をする',
  },
  3: {
    type: 3,
    name: '3種（前後型）',
    category: '前後型',
    subcategory: '呼吸器型',
    emoji: '💭',
    keyTraits: ['感情豊か', '共感力高', '表現力'],
    thinkingStyle: '感情で判断',
    actionStyle: '雰囲気重視',
    communication: '感情表現が豊か',
    shortDescription: 'コミュニケーション能力が高く、共感力がある',
  },
  4: {
    type: 4,
    name: '4種（前後型）',
    category: '前後型',
    subcategory: '泌尿器型',
    emoji: '🔍',
    keyTraits: ['繊細', '警戒心強', '完璧主義'],
    thinkingStyle: '慎重に判断',
    actionStyle: '用心深く行動',
    communication: '細部にこだわる',
    shortDescription: '観察力が鋭く、細かいことに気づきやすい',
  },
  5: {
    type: 5,
    name: '5種（前後型）',
    category: '前後型',
    subcategory: '生殖器型',
    emoji: '⚡',
    keyTraits: ['直感的', '創造的', '行動的'],
    thinkingStyle: '直感で判断',
    actionStyle: '素早く行動',
    communication: '本能的・感覚的',
    shortDescription: 'エネルギッシュで、創造性と行動力がある',
  },
  6: {
    type: 6,
    name: '6種（左右型）',
    category: '左右型',
    subcategory: '頭脳・分析型',
    emoji: '📊',
    keyTraits: ['論理的', '分析的', '合理的'],
    thinkingStyle: '論理で分析',
    actionStyle: '合理的に行動',
    communication: '客観的説明',
    shortDescription: '論理的思考と分析が得意で、客観的な視点を持つ',
  },
  7: {
    type: 7,
    name: '7種（左右型）',
    category: '左右型',
    subcategory: '感覚・美的型',
    emoji: '🎨',
    keyTraits: ['感受性豊', '美的センス', '感覚的'],
    thinkingStyle: '感覚で判断',
    actionStyle: '雰囲気を重視',
    communication: '感性的表現',
    shortDescription: '感覚的で美的センスがあり、雰囲気を大切にする',
  },
  8: {
    type: 8,
    name: '8種（左右型）',
    category: '左右型',
    subcategory: '社交・調和型',
    emoji: '🤝',
    keyTraits: ['社交的', 'バランス', '柔軟'],
    thinkingStyle: 'バランスを取る',
    actionStyle: '柔軟に対応',
    communication: '調和を大切に',
    shortDescription: '人との調和を大切にし、バランス感覚に優れる',
  },
  9: {
    type: 9,
    name: '9種（左右型）',
    category: '左右型',
    subcategory: '競争・勝負型',
    emoji: '🏆',
    keyTraits: ['競争心強', '積極的', '勝負好き'],
    thinkingStyle: '勝ち負けで判断',
    actionStyle: '積極的に行動',
    communication: '直接的・競争的',
    shortDescription: '競争心が強く、目標達成意欲が高い',
  },
  10: {
    type: 10,
    name: '10種（左右型）',
    category: '左右型',
    subcategory: '集中・こだわり型',
    emoji: '🎯',
    keyTraits: ['集中力高', 'こだわり強', '完璧追求'],
    thinkingStyle: '深く追究',
    actionStyle: '一点集中',
    communication: 'こだわりを持つ',
    shortDescription: '集中力が非常に高く、一つのことを深く追究する',
  },
};

/**
 * 複数タイプを比較するためのヘルパー関数
 */
export function compareTypes(types: number[]): TaihekiTypeComparison[] {
  return types
    .filter((type) => type >= 1 && type <= 10)
    .map((type) => TAIHEKI_COMPARISON_DATA[type])
    .filter(Boolean);
}

/**
 * カテゴリー別にタイプをグループ化
 */
export function groupByCategory(): Record<string, TaihekiTypeComparison[]> {
  const groups: Record<string, TaihekiTypeComparison[]> = {
    上下型: [],
    前後型: [],
    左右型: [],
  };

  Object.values(TAIHEKI_COMPARISON_DATA).forEach((type) => {
    groups[type.category].push(type);
  });

  return groups;
}
