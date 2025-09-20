// 60アニマル占いと志向のマッピング

export interface AnimalFortuneData {
  id: number;
  baseAnimal: string;
  character: string;
  color: string;
  orientation: 'people_oriented' | 'castle_oriented' | 'big_vision_oriented';
}

export const ANIMAL_FORTUNE_MAPPING: Record<number, AnimalFortuneData> = {
  // 1-10
  1: { id: 1, baseAnimal: 'チーター', character: '長距離ランナーのチータ', color: 'イエロー', orientation: 'big_vision_oriented' },
  2: { id: 2, baseAnimal: 'たぬき', character: '社交家のたぬき', color: 'グリーン', orientation: 'people_oriented' },
  3: { id: 3, baseAnimal: '猿', character: '落ち着きのない猿', color: 'レッド', orientation: 'castle_oriented' },
  4: { id: 4, baseAnimal: 'コアラ', character: 'フットワークの軽い子守熊', color: 'オレンジ', orientation: 'castle_oriented' },
  5: { id: 5, baseAnimal: '黒ひょう', character: '面倒見のいい黒ひょう', color: 'ブラウン', orientation: 'people_oriented' },
  6: { id: 6, baseAnimal: '虎', character: '愛情あふれる虎', color: 'ブラック', orientation: 'people_oriented' },
  7: { id: 7, baseAnimal: 'チーター', character: '全力疾走するチータ', color: 'ゴールド', orientation: 'big_vision_oriented' },
  8: { id: 8, baseAnimal: 'たぬき', character: '磨き上げられたたぬき', color: 'シルバー', orientation: 'people_oriented' },
  9: { id: 9, baseAnimal: '猿', character: '大きな志をもった猿', color: 'ブルー', orientation: 'castle_oriented' },
  10: { id: 10, baseAnimal: 'コアラ', character: '母性豊かな子守熊', color: 'パープル', orientation: 'castle_oriented' },
  
  // 11-20
  11: { id: 11, baseAnimal: 'こじか', character: '正直なこじか', color: 'イエロー', orientation: 'people_oriented' },
  12: { id: 12, baseAnimal: 'ゾウ', character: '人気者のゾウ', color: 'グリーン', orientation: 'big_vision_oriented' },
  13: { id: 13, baseAnimal: '狼', character: 'ネアカの狼', color: 'レッド', orientation: 'castle_oriented' },
  14: { id: 14, baseAnimal: 'ひつじ', character: '協調性のないひつじ', color: 'オレンジ', orientation: 'people_oriented' },
  15: { id: 15, baseAnimal: '猿', character: 'どっしりとした猿', color: 'ブラウン', orientation: 'castle_oriented' },
  16: { id: 16, baseAnimal: 'コアラ', character: 'コアラのなかの子守熊', color: 'ブラック', orientation: 'castle_oriented' },
  17: { id: 17, baseAnimal: 'こじか', character: '強い意志をもったこじか', color: 'ゴールド', orientation: 'people_oriented' },
  18: { id: 18, baseAnimal: 'ゾウ', character: 'デリケートなゾウ', color: 'シルバー', orientation: 'big_vision_oriented' },
  19: { id: 19, baseAnimal: '狼', character: '放浪の狼', color: 'ブルー', orientation: 'castle_oriented' },
  20: { id: 20, baseAnimal: 'ひつじ', character: '物静かなひつじ', color: 'パープル', orientation: 'people_oriented' },
  
  // 21-30
  21: { id: 21, baseAnimal: 'ペガサス', character: '落ち着きのあるペガサス', color: 'イエロー', orientation: 'big_vision_oriented' },
  22: { id: 22, baseAnimal: 'ペガサス', character: '強靭な翼をもつペガサス', color: 'グリーン', orientation: 'big_vision_oriented' },
  23: { id: 23, baseAnimal: 'ひつじ', character: '無邪気なひつじ', color: 'レッド', orientation: 'people_oriented' },
  24: { id: 24, baseAnimal: '狼', character: 'クリエイティブな狼', color: 'オレンジ', orientation: 'castle_oriented' },
  25: { id: 25, baseAnimal: '狼', character: '穏やかな狼', color: 'ブラウン', orientation: 'castle_oriented' },
  26: { id: 26, baseAnimal: 'ひつじ', character: '粘り強いひつじ', color: 'ブラック', orientation: 'people_oriented' },
  27: { id: 27, baseAnimal: 'ペガサス', character: '波乱に満ちたペガサス', color: 'ゴールド', orientation: 'big_vision_oriented' },
  28: { id: 28, baseAnimal: 'ペガサス', character: '優雅なペガサス', color: 'シルバー', orientation: 'big_vision_oriented' },
  29: { id: 29, baseAnimal: 'ひつじ', character: 'チャレンジ精神旺盛なひつじ', color: 'ブルー', orientation: 'people_oriented' },
  30: { id: 30, baseAnimal: '狼', character: '順応性のある狼', color: 'パープル', orientation: 'castle_oriented' },
  
  // 31-40
  31: { id: 31, baseAnimal: 'ゾウ', character: 'リーダーとなるゾウ', color: 'イエロー', orientation: 'big_vision_oriented' },
  32: { id: 32, baseAnimal: 'こじか', character: 'しっかり者のこじか', color: 'グリーン', orientation: 'people_oriented' },
  33: { id: 33, baseAnimal: 'コアラ', character: '活動的な子守熊', color: 'レッド', orientation: 'castle_oriented' },
  34: { id: 34, baseAnimal: '猿', character: '気分屋の猿', color: 'オレンジ', orientation: 'castle_oriented' },
  35: { id: 35, baseAnimal: 'ひつじ', character: '頼られると嬉しいひつじ', color: 'ブラウン', orientation: 'people_oriented' },
  36: { id: 36, baseAnimal: '狼', character: '好感のもたれる狼', color: 'ブラック', orientation: 'castle_oriented' },
  37: { id: 37, baseAnimal: 'ゾウ', character: 'まっしぐらに突き進むゾウ', color: 'ゴールド', orientation: 'big_vision_oriented' },
  38: { id: 38, baseAnimal: 'こじか', character: '華やかなこじか', color: 'シルバー', orientation: 'people_oriented' },
  39: { id: 39, baseAnimal: 'コアラ', character: '夢とロマンの子守熊', color: 'ブルー', orientation: 'castle_oriented' },
  40: { id: 40, baseAnimal: '猿', character: '尽す猿', color: 'パープル', orientation: 'castle_oriented' },
  
  // 41-50
  41: { id: 41, baseAnimal: 'たぬき', character: '大器晩成のたぬき', color: 'イエロー', orientation: 'people_oriented' },
  42: { id: 42, baseAnimal: 'チーター', character: '足腰の強いチータ', color: 'グリーン', orientation: 'big_vision_oriented' },
  43: { id: 43, baseAnimal: '虎', character: '動きまわる虎', color: 'レッド', orientation: 'castle_oriented' },
  44: { id: 44, baseAnimal: '黒ひょう', character: '情熱的な黒ひょう', color: 'オレンジ', orientation: 'people_oriented' },
  45: { id: 45, baseAnimal: 'コアラ', character: 'サービス精神旺盛な子守熊', color: 'ブラウン', orientation: 'castle_oriented' },
  46: { id: 46, baseAnimal: '猿', character: '守りの猿', color: 'ブラック', orientation: 'castle_oriented' },
  47: { id: 47, baseAnimal: 'たぬき', character: '人間味あふれるたぬき', color: 'ゴールド', orientation: 'people_oriented' },
  48: { id: 48, baseAnimal: 'チーター', character: '品格のあるチータ', color: 'シルバー', orientation: 'big_vision_oriented' },
  49: { id: 49, baseAnimal: '虎', character: 'ゆったりとした悠然の虎', color: 'ブルー', orientation: 'castle_oriented' },
  50: { id: 50, baseAnimal: '黒ひょう', character: '落ち込みの激しい黒ひょう', color: 'パープル', orientation: 'people_oriented' },
  
  // 51-60
  51: { id: 51, baseAnimal: 'ライオン', character: '我が道を行くライオン', color: 'イエロー', orientation: 'big_vision_oriented' },
  52: { id: 52, baseAnimal: 'ライオン', character: '統率力のあるライオン', color: 'グリーン', orientation: 'big_vision_oriented' },
  53: { id: 53, baseAnimal: '黒ひょう', character: '感情豊かな黒ひょう', color: 'レッド', orientation: 'people_oriented' },
  54: { id: 54, baseAnimal: '虎', character: '楽天的な虎', color: 'オレンジ', orientation: 'castle_oriented' },
  55: { id: 55, baseAnimal: '虎', character: 'パワフルな虎', color: 'ブラウン', orientation: 'castle_oriented' },
  56: { id: 56, baseAnimal: '黒ひょう', character: '気どらない黒ひょう', color: 'ブラック', orientation: 'people_oriented' },
  57: { id: 57, baseAnimal: 'ライオン', character: '感情的なライオン', color: 'ゴールド', orientation: 'big_vision_oriented' },
  58: { id: 58, baseAnimal: 'ライオン', character: '傷つきやすいライオン', color: 'シルバー', orientation: 'big_vision_oriented' },
  59: { id: 59, baseAnimal: '黒ひょう', character: '束縛を嫌う黒ひょう', color: 'ブルー', orientation: 'people_oriented' },
  60: { id: 60, baseAnimal: '虎', character: '慈悲深い虎', color: 'パープル', orientation: 'castle_oriented' }
};

// 志向の日本語ラベル
export const ORIENTATION_LABELS = {
  'people_oriented': '人間指向',
  'castle_oriented': '城指向', 
  'big_vision_oriented': '大局指向'
} as const;

// 基本動物から60アニマルのリストを取得
export const getAnimalsByBaseAnimal = (baseAnimal: string): AnimalFortuneData[] => {
  return Object.values(ANIMAL_FORTUNE_MAPPING).filter(
    animal => animal.baseAnimal === baseAnimal
  );
};

// IDから動物データを取得
export const getAnimalFortuneById = (id: number): AnimalFortuneData | undefined => {
  return ANIMAL_FORTUNE_MAPPING[id];
};

// 完全な動物名（character）から志向を取得
export const getOrientationByCharacter = (character: string): string | undefined => {
  const animal = Object.values(ANIMAL_FORTUNE_MAPPING).find(
    animal => animal.character === character
  );
  return animal ? animal.orientation : undefined;
};

// 完全な60アニマルのリスト（選択肢用）
export const FULL_ANIMAL_OPTIONS = Object.values(ANIMAL_FORTUNE_MAPPING).map(animal => ({
  value: animal.character,
  label: animal.character,
  baseAnimal: animal.baseAnimal,
  color: animal.color,
  orientation: animal.orientation
}));