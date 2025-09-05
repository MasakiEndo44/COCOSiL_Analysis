/**
 * 算命学API精度検証用テストデータ
 * 出典: docs/input/20250903_算命学正解表.md
 */

export interface PrecisionTestCase {
  no: number;
  name: string;
  input: {
    year: number;
    month: number;
    day: number;
  };
  expected: {
    age: number;                    // 満年齢（2025年1月基準）
    western_zodiac: string;         // 西洋12星座
    animal_character: string;       // 動物キャラクター（60種）
    six_star: string;              // 六星占術
    zodiac?: string;               // 十二支（追加検証用）
    tenchusatsu_years?: number[];  // 天中殺年（追加検証用）
  };
  source: string;
  notes?: string;
}

/**
 * 正解データリスト（10セット）
 * 2025年1月5日基準での年齢計算
 */
export const PRECISION_TEST_CASES: PrecisionTestCase[] = [
  {
    no: 1,
    name: "2008年世代・山羊座・たぬき・木星人+",
    input: { year: 2008, month: 1, day: 5 },
    expected: {
      age: 17,
      western_zodiac: "山羊座",
      animal_character: "大器晩成のたぬき",
      six_star: "木星人+",
      zodiac: "申",  // 2008年は申年
      tenchusatsu_years: [2014, 2015] // 申年の天中殺は午未
    },
    source: "20250903_算命学正解表.md",
    notes: "最新世代テストケース"
  },
  {
    no: 2,
    name: "1984年世代・牡羊座・ひつじ・金星人+", 
    input: { year: 1984, month: 4, day: 13 },
    expected: {
      age: 40, // 2025年1月時点では未誕生日のため40歳
      western_zodiac: "牡羊座",
      animal_character: "協調性のないひつじ",
      six_star: "金星人+",
      zodiac: "子", // 1984年は子年
      tenchusatsu_years: [1990, 1991] // 子年の天中殺は戌亥
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 3,
    name: "1994年世代・山羊座・こじか・火星人+",
    input: { year: 1994, month: 12, day: 29 },
    expected: {
      age: 30,
      western_zodiac: "山羊座", 
      animal_character: "華やかなこじか",
      six_star: "火星人+",
      zodiac: "戌", // 1994年は戌年
      tenchusatsu_years: [2000, 2001] // 戌年の天中殺は申酉
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 4,
    name: "1982年世代・山羊座・狼・火星人+",
    input: { year: 1982, month: 1, day: 4 },
    expected: {
      age: 43,
      western_zodiac: "山羊座",
      animal_character: "クリエイティブな狼",  
      six_star: "火星人+",
      zodiac: "戌", // 1982年は戌年
      tenchusatsu_years: [1988, 1989] // 戌年の天中殺は申酉
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 5,
    name: "2001年世代・魚座・黒ひょう・水星人-",
    input: { year: 2001, month: 2, day: 25 },
    expected: {
      age: 23, // 2025年1月時点では未誕生日のため23歳
      western_zodiac: "魚座",
      animal_character: "気どらない黒ひょう",
      six_star: "水星人-",
      zodiac: "巳", // 2001年は巳年  
      tenchusatsu_years: [2007, 2008] // 巳年の天中殺は辰巳
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 6,
    name: "1995年世代・双子座・ライオン・水星人-",
    input: { year: 1995, month: 5, day: 30 },
    expected: {
      age: 29, // 2025年1月時点では未誕生日のため29歳
      western_zodiac: "双子座",
      animal_character: "傷つきやすいライオン",
      six_star: "水星人-",
      zodiac: "亥", // 1995年は亥年
      tenchusatsu_years: [2001, 2002] // 亥年の天中殺は申酉
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 7,
    name: "1970年世代・双子座・ライオン・水星人+",
    input: { year: 1970, month: 6, day: 10 },
    expected: {
      age: 54, // 2025年1月時点では未誕生日のため54歳
      western_zodiac: "双子座",
      animal_character: "傷つきやすいライオン",
      six_star: "水星人+",
      zodiac: "戌", // 1970年は戌年
      tenchusatsu_years: [1976, 1977] // 戌年の天中殺は申酉
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 8,
    name: "1966年世代・水瓶座・ひつじ・火星人+霊合星",
    input: { year: 1966, month: 1, day: 30 },
    expected: {
      age: 59,
      western_zodiac: "水瓶座",
      animal_character: "粘り強いひつじ",
      six_star: "火星人+", // 霊合星は特殊パターン
      zodiac: "午", // 1966年は午年
      tenchusatsu_years: [1972, 1973] // 午年の天中殺は辰巳
    },
    source: "20250903_算命学正解表.md",
    notes: "霊合星パターン - 六星占術の特殊ケース"
  },
  {
    no: 9,
    name: "1984年世代・蟹座・こじか・天王星人+",
    input: { year: 1984, month: 6, day: 30 },
    expected: {
      age: 40, // 2025年1月時点では未誕生日のため40歳
      western_zodiac: "蟹座",
      animal_character: "しっかり者のこじか",
      six_star: "天王星人+",
      zodiac: "子", // 1984年は子年
      tenchusatsu_years: [1990, 1991] // 子年の天中殺は戌亥
    },
    source: "20250903_算命学正解表.md"
  },
  {
    no: 10,
    name: "2013年世代・牡羊座・チーター・木星人-",
    input: { year: 2013, month: 4, day: 9 },
    expected: {
      age: 11, // 2025年1月時点では未誕生日のため11歳
      western_zodiac: "牡羊座", 
      animal_character: "足腰の強いチーター", 
      six_star: "木星人-",
      zodiac: "巳", // 2013年は巳年
      tenchusatsu_years: [2019, 2020] // 巳年の天中殺は辰巳
    },
    source: "20250903_算命学正解表.md",
    notes: "最年少テストケース"
  }
] as const;

/**
 * テストデータの統計情報
 */
export const TEST_DATA_STATISTICS = {
  totalCases: PRECISION_TEST_CASES.length,
  ageRange: {
    min: Math.min(...PRECISION_TEST_CASES.map(t => t.expected.age)),
    max: Math.max(...PRECISION_TEST_CASES.map(t => t.expected.age))
  },
  yearRange: {
    min: Math.min(...PRECISION_TEST_CASES.map(t => t.input.year)),
    max: Math.max(...PRECISION_TEST_CASES.map(t => t.input.year))
  },
  uniqueSixStars: [...new Set(PRECISION_TEST_CASES.map(t => t.expected.six_star))],
  uniqueZodiacs: [...new Set(PRECISION_TEST_CASES.map(t => t.expected.western_zodiac))],
  coverage: {
    decadesCovered: ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s'],
    sixStarsCovered: 8, // 木星人±, 金星人±, 火星人±, 水星人±, 天王星人+
    zodiacsCovered: 6   // 山羊座, 牡羊座, 魚座, 双子座, 水瓶座, 蟹座
  }
} as const;

/**
 * 現行APIレスポンス型定義（検証用）
 */
export interface CurrentAPIResponse {
  age: number;
  zodiac: string;           // 十二支
  animal: string;           // 基本動物名（12種）
  six_star: string;         // 六星占術
  fortune_detail: {
    birth_date: string;
    chinese_zodiac: string;
    animal_fortune: string;
    six_star_detail: string;
    personality_traits: string[];
  };
}

/**
 * 精度計算用ヘルパー関数
 */
export class AccuracyCalculator {
  /**
   * 動物キャラクター名の正規化
   * 「大器晩成のたぬき」→「たぬき」抽出
   */
  static normalizeAnimalCharacter(character: string): string {
    const animalPattern = /(チーター|黒ひょう|ライオン|トラ|たぬき|コアラ|ゾウ|ひつじ|ペガサス|狼|サル|こじか)/;
    const match = character.match(animalPattern);
    return match ? match[1] : character;
  }

  /**
   * 六星占術の正規化
   * 「火星人+ 霊合星」→「火星人+」抽出
   */
  static normalizeSixStar(sixStar: string): string {
    return sixStar.split(' ')[0]; // 霊合星等の付加情報を除去
  }

  /**
   * 年齢計算の検証（2025年1月5日基準）
   */
  static calculateExpectedAge(year: number, month: number, day: number): number {
    const referenceDate = new Date(2025, 0, 5); // 2025年1月5日
    const birthDate = new Date(year, month - 1, day);
    
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    
    // 誕生日前なら-1
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * 十二支計算（基準年4年=甲子からのオフセット）
   */
  static calculateZodiac(year: number): string {
    const zodiacAnimals = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    return zodiacAnimals[(year - 4) % 12];
  }
}

/**
 * テストケース妥当性検証
 */
export function validateTestCases(): void {
  console.log('🔍 テストケース妥当性検証開始...');
  
  let validationErrors = 0;
  
  for (const testCase of PRECISION_TEST_CASES) {
    // 年齢計算検証
    const calculatedAge = AccuracyCalculator.calculateExpectedAge(
      testCase.input.year, 
      testCase.input.month, 
      testCase.input.day
    );
    
    if (calculatedAge !== testCase.expected.age) {
      console.error(
        `❌ No.${testCase.no}: 年齢不一致 - 期待値:${testCase.expected.age}歳, 計算値:${calculatedAge}歳`
      );
      validationErrors++;
    }
    
    // 十二支検証
    if (testCase.expected.zodiac) {
      const calculatedZodiac = AccuracyCalculator.calculateZodiac(testCase.input.year);
      if (calculatedZodiac !== testCase.expected.zodiac) {
        console.error(
          `❌ No.${testCase.no}: 十二支不一致 - 期待値:${testCase.expected.zodiac}, 計算値:${calculatedZodiac}`
        );
        validationErrors++;
      }
    }
  }
  
  if (validationErrors === 0) {
    console.log('✅ テストケース妥当性検証完了 - エラーなし');
  } else {
    console.warn(`⚠️  テストケース妥当性検証完了 - ${validationErrors}件のエラーあり`);
  }
}

// 実行時検証
if (require.main === module) {
  validateTestCases();
}