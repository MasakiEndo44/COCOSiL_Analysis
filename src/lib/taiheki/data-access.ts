/**
 * 体癖診断 データアクセス層
 * 
 * 質問データ取得とデータベース操作の抽象化
 * - 質問マスタ読み込み
 * - 4択制約対応
 * - キャッシュ機能
 * - パフォーマンス最適化
 */

import { 
  TaihekiQuestion,
  TaihekiDiagnosisError,
  ERROR_CODES,
  TAIHEKI_CONFIG 
} from '@/types/taiheki';

// ============================================================
// メモリキャッシュ（開発・テスト環境）
// ============================================================

interface QuestionCache {
  questions: TaihekiQuestion[];
  lastUpdated: number;
}

let questionCache: QuestionCache | null = null;
const CACHE_TTL_MS = TAIHEKI_CONFIG.CACHE_TTL_SECONDS * 1000;

// ============================================================
// 質問データ読み込み（メインAPI）
// ============================================================

export async function getTaihekiQuestions(): Promise<TaihekiQuestion[]> {
  // キャッシュチェック
  if (questionCache && (Date.now() - questionCache.lastUpdated) < CACHE_TTL_MS) {
    return [...questionCache.questions]; // 防御的コピー
  }
  
  try {
    // 本格実装時はPrismaクライアントからDB読み込み
    // 現在は静的データからの読み込み
    const questions = await loadQuestionsFromStaticData();
    
    // キャッシュ更新
    questionCache = {
      questions: [...questions],
      lastUpdated: Date.now()
    };
    
    return questions;
    
  } catch (error) {
    console.error('Failed to load taiheki questions:', error);
    throw new TaihekiDiagnosisError(
      'Failed to load diagnosis questions',
      ERROR_CODES.DATABASE_ERROR,
      { originalError: error }
    );
  }
}

// ============================================================
// 静的質問データ（HTMLファイル移植版）
// ============================================================

async function loadQuestionsFromStaticData(): Promise<TaihekiQuestion[]> {
  // HTMLファイルから移植した20問の体癖診断質問
  const questions: TaihekiQuestion[] = [
    // 1. 体型・身体特徴カテゴリ
    {
      id: 1,
      type: 'single',
      weight: 1.2,
      text: '体型について、最も当てはまるものを選んでください。',
      category: 'physical',
      maxSelections: 2,
      options: [
        {
          text: '縦に長く、すらっとした印象',
          scores: { type1: 3.0, type2: 2.5 },
          confidenceLevel: 0.9
        },
        {
          text: '横に広く、どっしりした印象',
          scores: { type9: 3.0, type10: 2.8 },
          confidenceLevel: 0.9
        },
        {
          text: '前後に厚みがあり、立体的',
          scores: { type5: 3.2, type6: 2.5 },
          confidenceLevel: 0.85
        },
        {
          text: 'ねじれるような動きが目立つ',
          scores: { type7: 3.5, type8: 2.8 },
          confidenceLevel: 0.8
        }
      ]
    },
    
    {
      id: 2,
      type: 'single',
      weight: 1.0,
      text: '歩き方や立ち姿で特徴的なのは？',
      category: 'physical',
      maxSelections: 2,
      options: [
        {
          text: '背筋がまっすぐで、きちんとした姿勢',
          scores: { type1: 2.8, type2: 3.0 },
          confidenceLevel: 0.85
        },
        {
          text: '左右に揺れるような、リズミカルな歩き方',
          scores: { type3: 3.2, type4: 2.2 },
          confidenceLevel: 0.9
        },
        {
          text: '前のめりで、せかせかした歩き方',
          scores: { type5: 3.5, type6: 1.8 },
          confidenceLevel: 0.9
        },
        {
          text: 'ゆったりと、安定感のある歩き方',
          scores: { type9: 2.5, type10: 3.0 },
          confidenceLevel: 0.8
        }
      ]
    },

    // 2. 行動パターンカテゴリ  
    {
      id: 3,
      type: 'single',
      weight: 1.1,
      text: '決断をするときの傾向は？',
      category: 'behavioral',
      maxSelections: 2,
      options: [
        {
          text: '論理的に分析してから結論を出す',
          scores: { type1: 3.5, type4: 2.0 },
          confidenceLevel: 0.9
        },
        {
          text: '直感やその場の雰囲気で決める',
          scores: { type3: 3.0, type7: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '慎重に時間をかけて検討する',
          scores: { type2: 3.2, type6: 2.8 },
          confidenceLevel: 0.85
        },
        {
          text: '素早く効率重視で決断する',
          scores: { type5: 3.8, type8: 2.2 },
          confidenceLevel: 0.9
        }
      ]
    },

    {
      id: 4,
      type: 'single',
      weight: 1.0,
      text: 'ストレスを感じるときは？',
      category: 'behavioral',
      maxSelections: 2,
      options: [
        {
          text: '理屈に合わないことがあるとき',
          scores: { type1: 3.0, type2: 2.5 },
          confidenceLevel: 0.85
        },
        {
          text: '人間関係がうまくいかないとき',
          scores: { type3: 2.8, type4: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: '効率が悪く時間が無駄になるとき',
          scores: { type5: 3.2, type8: 2.0 },
          confidenceLevel: 0.8
        },
        {
          text: '変化が激しく落ち着かないとき',
          scores: { type6: 2.5, type9: 3.0, type10: 2.8 },
          confidenceLevel: 0.75
        }
      ]
    },

    {
      id: 5,
      type: 'single',
      weight: 1.15,
      text: '仕事や勉強のスタイルは？',
      category: 'behavioral', 
      maxSelections: 2,
      options: [
        {
          text: '計画を立てて段階的に進める',
          scores: { type1: 2.8, type2: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: '人とのコミュニケーションを大切にする',
          scores: { type3: 3.8, type10: 2.5 },
          confidenceLevel: 0.85
        },
        {
          text: 'スピード重視で効率的に進める',
          scores: { type5: 4.0, type7: 2.2 },
          confidenceLevel: 0.95
        },
        {
          text: '一つのことに深く集中して取り組む',
          scores: { type6: 2.8, type9: 3.5 },
          confidenceLevel: 0.9
        }
      ]
    },

    // 3. 思考パターンカテゴリ
    {
      id: 6,
      type: 'single',
      weight: 1.0,
      text: '物事を考えるときの特徴は？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: '筋道を立てて論理的に考える',
          scores: { type1: 3.8, type4: 1.8 },
          confidenceLevel: 0.95
        },
        {
          text: '感情や直感を重視して考える',
          scores: { type3: 3.5, type6: 2.8 },
          confidenceLevel: 0.9
        },
        {
          text: '過去の経験と照らし合わせて考える',
          scores: { type2: 3.0, type8: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '全体を見渡して総合的に考える',
          scores: { type9: 2.5, type10: 3.2 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 7,
      type: 'single',
      weight: 1.0,
      text: '新しいことに対する姿勢は？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: 'まず理解してから取り組む',
          scores: { type1: 2.8, type2: 3.2 },
          confidenceLevel: 0.85
        },
        {
          text: '楽しそうなら積極的に挑戦する',
          scores: { type3: 3.5, type7: 2.8 },
          confidenceLevel: 0.9
        },
        {
          text: '効果的かどうかを判断してから行動',
          scores: { type5: 3.0, type8: 2.2 },
          confidenceLevel: 0.8
        },
        {
          text: '慎重に様子を見てから参加',
          scores: { type4: 2.5, type6: 2.8, type9: 3.0 },
          confidenceLevel: 0.75
        }
      ]
    },

    // 4. 社会的側面カテゴリ
    {
      id: 8,
      type: 'single',
      weight: 0.9,
      text: '人との付き合い方の特徴は？',
      category: 'social',
      maxSelections: 2,
      options: [
        {
          text: '公平で一貫した態度を保つ',
          scores: { type1: 3.0, type4: 2.8 },
          confidenceLevel: 0.85
        },
        {
          text: '明るく社交的で場を盛り上げる',
          scores: { type3: 4.0, type10: 2.5 },
          confidenceLevel: 0.95
        },
        {
          text: '責任感が強く面倒見が良い',
          scores: { type2: 2.8, type8: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: '個人主義で自分のペースを大切にする',
          scores: { type5: 2.2, type6: 3.0, type9: 2.8 },
          confidenceLevel: 0.8
        }
      ]
    },

    // 5-20問目: 詳細な診断精度向上のための質問群
    {
      id: 9,
      type: 'single',
      weight: 1.1,
      text: '感情の表現について最も当てはまるのは？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: '感情をあまり外に出さず、冷静を保つ',
          scores: { type1: 2.5, type4: 3.5, type9: 2.0 },
          confidenceLevel: 0.9
        },
        {
          text: '感情豊かで表情や態度に表れやすい',
          scores: { type3: 4.0, type7: 2.5 },
          confidenceLevel: 0.95
        },
        {
          text: '心配や不安を感じやすい',
          scores: { type2: 3.8, type6: 2.2 },
          confidenceLevel: 0.9
        },
        {
          text: '怒りっぽいが情に厚い',
          scores: { type7: 3.2, type8: 3.0 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 10,
      type: 'single',
      weight: 1.0,
      text: '食べ物の好みで特徴的なのは？',
      category: 'physical',
      maxSelections: 2,
      options: [
        {
          text: 'あっさりした上品な味を好む',
          scores: { type1: 2.8, type4: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '美味しいものが大好きで食べることが楽しみ',
          scores: { type3: 3.5, type10: 3.0 },
          confidenceLevel: 0.9
        },
        {
          text: '栄養バランスや効率性を重視',
          scores: { type2: 2.5, type5: 3.0 },
          confidenceLevel: 0.8
        },
        {
          text: '濃い味や刺激的な味を好む',
          scores: { type7: 3.2, type8: 2.8 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 11,
      type: 'single',
      weight: 1.0,
      text: '疲れたときの回復方法は？',
      category: 'behavioral',
      maxSelections: 2,
      options: [
        {
          text: '一人の時間を持って静かに休む',
          scores: { type1: 2.5, type4: 2.8, type6: 3.0, type9: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '人と話したり、楽しいことをして発散',
          scores: { type3: 3.8, type7: 2.5 },
          confidenceLevel: 0.9
        },
        {
          text: '早めに寝て規則正しい生活で回復',
          scores: { type2: 3.2, type5: 2.0 },
          confidenceLevel: 0.85
        },
        {
          text: '体を動かして汗を流す',
          scores: { type5: 2.8, type7: 3.0, type8: 2.5 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 12,
      type: 'single',
      weight: 1.2,
      text: '集中力の特徴は？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: '一度集中すると長時間持続する',
          scores: { type1: 2.8, type6: 3.0, type9: 3.8 },
          confidenceLevel: 0.9
        },
        {
          text: '集中力にムラがあり、興味次第',
          scores: { type3: 3.0, type7: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '短時間でも高い集中力を発揮',
          scores: { type5: 3.5, type8: 2.2 },
          confidenceLevel: 0.9
        },
        {
          text: '周囲の環境に左右されやすい',
          scores: { type2: 2.5, type4: 3.2, type10: 2.8 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 13,
      type: 'single',
      weight: 1.1,
      text: 'リーダーシップのタイプは？',
      category: 'social',
      maxSelections: 2,
      options: [
        {
          text: '論理的で公正な判断でチームを導く',
          scores: { type1: 3.5, type4: 2.0 },
          confidenceLevel: 0.9
        },
        {
          text: 'カリスマ性で人を引っ張っていく',
          scores: { type3: 2.8, type7: 3.8 },
          confidenceLevel: 0.9
        },
        {
          text: '責任感を持ってサポート役に回る',
          scores: { type2: 3.0, type8: 3.5 },
          confidenceLevel: 0.85
        },
        {
          text: '包容力で皆をまとめ上げる',
          scores: { type6: 2.5, type10: 4.0 },
          confidenceLevel: 0.95
        }
      ]
    },

    {
      id: 14,
      type: 'single',
      weight: 1.0,
      text: '時間の使い方について最も当てはまるのは？',
      category: 'behavioral',
      maxSelections: 2,
      options: [
        {
          text: '予定をきちんと立てて計画的に行動',
          scores: { type1: 2.8, type2: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: 'その時の気分や状況に合わせて柔軟に',
          scores: { type3: 3.2, type6: 2.5 },
          confidenceLevel: 0.8
        },
        {
          text: '効率を重視して無駄な時間を削る',
          scores: { type5: 4.0, type9: 2.2 },
          confidenceLevel: 0.95
        },
        {
          text: 'ゆとりを持ってゆったりと過ごす',
          scores: { type4: 2.0, type8: 2.8, type10: 3.2 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 15,
      type: 'single',
      weight: 1.0,
      text: '競争や勝負について最も当てはまるのは？',
      category: 'social',
      maxSelections: 2,
      options: [
        {
          text: '勝ち負けよりも正々堂々としたプロセスを重視',
          scores: { type1: 3.0, type2: 2.5 },
          confidenceLevel: 0.85
        },
        {
          text: '勝負事は大好きで負けず嫌い',
          scores: { type3: 2.8, type7: 4.0 },
          confidenceLevel: 0.95
        },
        {
          text: '競争はあまり好まず協調を重視',
          scores: { type4: 3.2, type6: 2.8, type10: 3.0 },
          confidenceLevel: 0.85
        },
        {
          text: '自分なりの基準で淡々と取り組む',
          scores: { type5: 2.5, type8: 2.8, type9: 3.2 },
          confidenceLevel: 0.8
        }
      ]
    },

    {
      id: 16,
      type: 'single',
      weight: 1.1,
      text: '美的センスや芸術的な好みは？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: 'シンプルで洗練されたものを好む',
          scores: { type1: 3.0, type4: 2.8 },
          confidenceLevel: 0.85
        },
        {
          text: '華やかで楽しい雰囲気のものを好む',
          scores: { type3: 3.5, type10: 2.5 },
          confidenceLevel: 0.9
        },
        {
          text: '実用性と機能美を重視',
          scores: { type2: 2.5, type5: 3.2 },
          confidenceLevel: 0.8
        },
        {
          text: '独特で個性的なものに惹かれる',
          scores: { type6: 3.8, type7: 2.2, type9: 3.0 },
          confidenceLevel: 0.9
        }
      ]
    },

    {
      id: 17,
      type: 'single',
      weight: 1.0,
      text: '困難や問題に直面したときの対応は？',
      category: 'behavioral',
      maxSelections: 2,
      options: [
        {
          text: '冷静に分析して解決策を見つける',
          scores: { type1: 3.5, type4: 2.5 },
          confidenceLevel: 0.9
        },
        {
          text: '周りの人に相談して協力を求める',
          scores: { type3: 3.0, type10: 3.2 },
          confidenceLevel: 0.85
        },
        {
          text: '正面から立ち向かって乗り越える',
          scores: { type5: 3.2, type7: 3.8 },
          confidenceLevel: 0.9
        },
        {
          text: 'じっくり考えて慎重に対処',
          scores: { type2: 3.0, type6: 2.8, type8: 2.5, type9: 2.8 },
          confidenceLevel: 0.8
        }
      ]
    },

    {
      id: 18,
      type: 'single',
      weight: 1.0,
      text: '家庭や私生活での過ごし方は？',
      category: 'social',
      maxSelections: 2,
      options: [
        {
          text: '整理整頓され、規則正しい生活',
          scores: { type1: 2.8, type2: 3.2 },
          confidenceLevel: 0.85
        },
        {
          text: '家族や友人との時間を大切にして賑やか',
          scores: { type3: 3.5, type10: 3.8 },
          confidenceLevel: 0.9
        },
        {
          text: '効率的で無駄のない生活スタイル',
          scores: { type5: 3.2, type9: 2.5 },
          confidenceLevel: 0.85
        },
        {
          text: '自分の時間を大切にしてゆったり',
          scores: { type4: 2.8, type6: 3.5, type8: 2.2 },
          confidenceLevel: 0.85
        }
      ]
    },

    {
      id: 19,
      type: 'single',
      weight: 1.0,
      text: '健康管理について最も当てはまるのは？',
      category: 'physical',
      maxSelections: 2,
      options: [
        {
          text: '規則正しい生活で体調を管理',
          scores: { type1: 2.5, type2: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: '楽しく食べて適度に運動',
          scores: { type3: 3.0, type10: 2.8 },
          confidenceLevel: 0.8
        },
        {
          text: '効率的なトレーニングで体力維持',
          scores: { type5: 3.8, type7: 2.5 },
          confidenceLevel: 0.9
        },
        {
          text: '無理をせず体の声に従って',
          scores: { type4: 2.5, type6: 3.0, type8: 2.8, type9: 2.5 },
          confidenceLevel: 0.8
        }
      ]
    },

    {
      id: 20,
      type: 'single',
      weight: 1.3,
      text: '人生において最も大切にしたい価値観は？',
      category: 'mental',
      maxSelections: 2,
      options: [
        {
          text: '正義と公正さ、真理の追求',
          scores: { type1: 4.0, type4: 2.5 },
          confidenceLevel: 0.95
        },
        {
          text: '愛情と人とのつながり',
          scores: { type3: 3.8, type10: 3.5 },
          confidenceLevel: 0.9
        },
        {
          text: '自由と効率性、成果の達成',
          scores: { type5: 3.5, type7: 3.0 },
          confidenceLevel: 0.9
        },
        {
          text: '調和と平和、安定した生活',
          scores: { type2: 3.2, type6: 3.0, type8: 3.5, type9: 2.8 },
          confidenceLevel: 0.85
        }
      ]
    }
  ];

  // 質問データ整合性検証
  validateQuestionsData(questions);
  
  return questions;
}

// ============================================================
// データ整合性検証
// ============================================================

function validateQuestionsData(questions: TaihekiQuestion[]): void {
  if (questions.length !== TAIHEKI_CONFIG.TOTAL_QUESTIONS) {
    throw new TaihekiDiagnosisError(
      `Invalid question count: expected ${TAIHEKI_CONFIG.TOTAL_QUESTIONS}, got ${questions.length}`,
      ERROR_CODES.INVALID_QUESTION
    );
  }

  questions.forEach(question => {
    // 4択制限チェック
    if (question.options && question.options.length > TAIHEKI_CONFIG.MAX_OPTIONS_PER_QUESTION) {
      throw new TaihekiDiagnosisError(
        `Question ${question.id} has too many options: ${question.options.length}`,
        ERROR_CODES.INVALID_QUESTION
      );
    }

    // スコア妥当性チェック
    if (question.options) {
      question.options.forEach((option, index) => {
        const scoreSum = Object.values(option.scores).reduce((sum, score) => sum + score, 0);
        if (scoreSum === 0) {
          console.warn(`Question ${question.id}, option ${index} has no scores`);
        }
        
        if (option.confidenceLevel && (option.confidenceLevel < 0 || option.confidenceLevel > 1)) {
          throw new TaihekiDiagnosisError(
            `Invalid confidence level for question ${question.id}, option ${index}`,
            ERROR_CODES.INVALID_QUESTION
          );
        }
      });
    }
  });
}

// ============================================================
// キャッシュ管理
// ============================================================

export function clearQuestionCache(): void {
  questionCache = null;
}

export function getQuestionCacheStats(): { cached: boolean; age: number } {
  return {
    cached: questionCache !== null,
    age: questionCache ? Date.now() - questionCache.lastUpdated : 0
  };
}

// ============================================================
// 個別質問取得（ユーティリティ）
// ============================================================

export async function getTaihekiQuestion(questionId: number): Promise<TaihekiQuestion | null> {
  const questions = await getTaihekiQuestions();
  return questions.find(q => q.id === questionId) || null;
}

export async function getTaihekiQuestionsRange(startId: number, endId: number): Promise<TaihekiQuestion[]> {
  const questions = await getTaihekiQuestions();
  return questions.filter(q => q.id >= startId && q.id <= endId);
}

// ============================================================
// 質問統計情報（開発・デバッグ用）
// ============================================================

export async function getQuestionStats(): Promise<{
  totalQuestions: number;
  categoryCounts: Record<string, number>;
  averageWeight: number;
  maxSelections: Record<number, number>;
}> {
  const questions = await getTaihekiQuestions();
  
  const categoryCounts: Record<string, number> = {};
  const maxSelections: Record<number, number> = {};
  let totalWeight = 0;

  questions.forEach(q => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    maxSelections[q.maxSelections] = (maxSelections[q.maxSelections] || 0) + 1;
    totalWeight += q.weight;
  });

  return {
    totalQuestions: questions.length,
    categoryCounts,
    averageWeight: totalWeight / questions.length,
    maxSelections
  };
}