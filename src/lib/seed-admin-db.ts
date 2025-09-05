import bcrypt from 'bcryptjs';
import { adminDb } from './admin-db';

export async function seedAdminDatabase() {
  try {
    console.log('管理者データベースの初期化を開始...');

    // デフォルト管理者アカウントを作成（.envからパスワード取得）
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await adminDb.adminUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
    });

    // 動物占いマスターデータ
    const animals = [
      { animal: '狼', orientation: 'people_oriented', trait: '一匹狼', strength: '独立心が強い', caution: '協調性を意識' },
      { animal: '子守熊', orientation: 'castle_oriented', trait: '面倒見が良い', strength: 'サポート力', caution: '自分の時間も大切に' },
      { animal: '猿', orientation: 'big_vision_oriented', trait: '器用で明るい', strength: '適応力', caution: '一点集中を心がけて' },
      { animal: 'チーター', orientation: 'people_oriented', trait: 'スピード重視', strength: '行動力', caution: 'じっくり考える時間も必要' },
      { animal: '黒ひょう', orientation: 'castle_oriented', trait: 'クールで冷静', strength: '分析力', caution: '感情表現も大切' },
      { animal: 'ライオン', orientation: 'big_vision_oriented', trait: 'リーダー気質', strength: '統率力', caution: '他人の意見も聞く' },
      { animal: '虎', orientation: 'people_oriented', trait: '勇敢で積極的', strength: '決断力', caution: '慎重さも必要' },
      { animal: '象', orientation: 'castle_oriented', trait: '忠実で真面目', strength: '信頼性', caution: '柔軟性を持つ' },
      { animal: 'ペガサス', orientation: 'big_vision_oriented', trait: '自由で創造的', strength: '発想力', caution: '現実性も考慮' },
      { animal: 'たぬき', orientation: 'people_oriented', trait: '穏やかで協調性', strength: '調和力', caution: '自己主張も大切' },
      { animal: 'こじか', orientation: 'castle_oriented', trait: '純粋で素直', strength: '誠実さ', caution: '現実を見る目も必要' },
      { animal: 'ひつじ', orientation: 'big_vision_oriented', trait: '平和主義', strength: '包容力', caution: '時には厳しさも必要' },
    ];

    for (const animal of animals) {
      await adminDb.animalMaster.upsert({
        where: { animal: animal.animal },
        update: {},
        create: animal,
      });
    }

    // 星座マスターデータ
    const zodiacSigns = [
      { zodiac: '牡羊座', period: '3/21-4/19', element: '火', nature: '活動宮', ruler: '火星' },
      { zodiac: '牡牛座', period: '4/20-5/20', element: '地', nature: '固定宮', ruler: '金星' },
      { zodiac: '双子座', period: '5/21-6/21', element: '風', nature: '柔軟宮', ruler: '水星' },
      { zodiac: '蟹座', period: '6/22-7/22', element: '水', nature: '活動宮', ruler: '月' },
      { zodiac: '獅子座', period: '7/23-8/22', element: '火', nature: '固定宮', ruler: '太陽' },
      { zodiac: '乙女座', period: '8/23-9/22', element: '地', nature: '柔軟宮', ruler: '水星' },
      { zodiac: '天秤座', period: '9/23-10/23', element: '風', nature: '活動宮', ruler: '金星' },
      { zodiac: '蠍座', period: '10/24-11/22', element: '水', nature: '固定宮', ruler: '冥王星' },
      { zodiac: '射手座', period: '11/23-12/21', element: '火', nature: '柔軟宮', ruler: '木星' },
      { zodiac: '山羊座', period: '12/22-1/19', element: '地', nature: '活動宮', ruler: '土星' },
      { zodiac: '水瓶座', period: '1/20-2/18', element: '風', nature: '固定宮', ruler: '天王星' },
      { zodiac: '魚座', period: '2/19-3/20', element: '水', nature: '柔軟宮', ruler: '海王星' },
    ];

    for (const zodiac of zodiacSigns) {
      await adminDb.zodiacMaster.upsert({
        where: { zodiac: zodiac.zodiac },
        update: {},
        create: zodiac,
      });
    }

    // MBTI マスターデータ
    const mbtiTypes = [
      { type: 'INTJ', nickname: '建築家', trait: '独立心が強く戦略的', strength: '長期計画立案', caution: '他者の感情への配慮' },
      { type: 'INTP', nickname: '論理学者', trait: '論理的で知識欲旺盛', strength: '問題解決力', caution: '実行力の向上' },
      { type: 'ENTJ', nickname: '指揮官', trait: 'リーダーシップがある', strength: '組織運営力', caution: '個人の価値観も尊重' },
      { type: 'ENTP', nickname: '討論者', trait: '革新的でエネルギッシュ', strength: '発想力', caution: '継続力の強化' },
      { type: 'INFJ', nickname: '提唱者', trait: '理想主義で洞察力がある', strength: '共感力', caution: '現実的判断も重要' },
      { type: 'INFP', nickname: '仲介者', trait: '価値観を大切にする', strength: '創造性', caution: '決断力の向上' },
      { type: 'ENFJ', nickname: '主人公', trait: '人々を導くカリスマ', strength: '人材育成力', caution: '自分の時間も大切に' },
      { type: 'ENFP', nickname: '運動家', trait: '熱意があり社交的', strength: 'モチベーション向上', caution: '計画性を持つ' },
      { type: 'ISTJ', nickname: '管理者', trait: '責任感が強く実直', strength: '信頼性', caution: '柔軟性を持つ' },
      { type: 'ISFJ', nickname: '擁護者', trait: '思いやりがあり献身的', strength: 'サポート力', caution: '自己主張も必要' },
      { type: 'ESTJ', nickname: '幹部', trait: '組織的で効率重視', strength: '管理能力', caution: '創造性も大切' },
      { type: 'ESFJ', nickname: '領事官', trait: '協調性があり親切', strength: 'チームワーク', caution: '批判的思考も必要' },
      { type: 'ISTP', nickname: '巨匠', trait: '実用的で冷静', strength: '技術力', caution: 'コミュニケーション向上' },
      { type: 'ISFP', nickname: '冒険家', trait: '芸術的で柔軟', strength: '審美眼', caution: '計画性の向上' },
      { type: 'ESTP', nickname: '起業家', trait: '行動力があり社交的', strength: '適応力', caution: '長期的視点を持つ' },
      { type: 'ESFP', nickname: '芸能人', trait: '明るく人懐っこい', strength: '場の雰囲気作り', caution: '責任感の強化' },
    ];

    for (const mbti of mbtiTypes) {
      await adminDb.mbtiMaster.upsert({
        where: { type: mbti.type },
        update: {},
        create: mbti,
      });
    }

    // 体癖マスターデータ
    const taihekiTypes = [
      { number: '1', type: '上下型', trait: '頭脳明晰、理論的', pattern: '上下の動き', career: '研究者、学者' },
      { number: '2', type: '上下型', trait: '感受性豊か、芸術的', pattern: '上下の動き', career: '芸術家、教育者' },
      { number: '3', type: '左右型', trait: '感情豊か、人情派', pattern: '左右の動き', career: '接客業、カウンセラー' },
      { number: '4', type: '左右型', trait: '合理的、計算高い', pattern: '左右の動き', career: '商売人、管理職' },
      { number: '5', type: '前後型', trait: '行動力がある、積極的', pattern: '前後の動き', career: 'スポーツ、営業' },
      { number: '6', type: '前後型', trait: '慎重、守備的', pattern: '前後の動き', career: '専門技術者、職人' },
      { number: '7', type: 'ねじれ型', trait: '器用、要領が良い', pattern: 'ねじれの動き', career: '技術者、調整役' },
      { number: '8', type: 'ねじれ型', trait: '独創的、マイペース', pattern: 'ねじれの動き', career: 'クリエイター、研究者' },
      { number: '9', type: '開閉型', trait: '集中力がある、職人気質', pattern: '開閉の動き', career: '専門職、技術者' },
      { number: '10', type: '開閉型', trait: '自由奔放、創造的', pattern: '開閉の動き', career: '芸術家、自営業' },
    ];

    for (const taiheki of taihekiTypes) {
      await adminDb.taihekiMaster.upsert({
        where: { number: taiheki.number },
        update: {},
        create: taiheki,
      });
    }

    // 6星占術マスターデータ
    const sixStarTypes = [
      { star: '土星', plusminus: '+', trait: '真面目で責任感が強い', career: '管理職、公務員', caution: '柔軟性を持つ' },
      { star: '土星', plusminus: '-', trait: '慎重で堅実', career: '専門職、研究者', caution: '積極性を持つ' },
      { star: '金星', plusminus: '+', trait: '美的センスがある', career: 'デザイナー、美容関係', caution: '現実性も大切' },
      { star: '金星', plusminus: '-', trait: '穏やかで協調性がある', career: '接客業、教育関係', caution: '自己主張も必要' },
      { star: '火星', plusminus: '+', trait: '行動力があり積極的', career: 'スポーツ、営業', caution: '計画性を持つ' },
      { star: '火星', plusminus: '-', trait: '情熱的だが短気', career: '技術職、職人', caution: '持続力を養う' },
      { star: '天王星', plusminus: '+', trait: '独創的でユニーク', career: 'クリエイター、発明家', caution: '協調性も大切' },
      { star: '天王星', plusminus: '-', trait: '自由を愛する', career: '自営業、芸術家', caution: '責任感を持つ' },
      { star: '木星', plusminus: '+', trait: '大器晩成で包容力がある', career: '経営者、指導者', caution: '細部への注意' },
      { star: '木星', plusminus: '-', trait: '温和で人望がある', career: 'カウンセラー、教師', caution: '決断力を持つ' },
      { star: '水星', plusminus: '+', trait: '知的で情報通', career: 'ジャーナリスト、研究者', caution: '実行力も必要' },
      { star: '水星', plusminus: '-', trait: '頭の回転が早い', career: 'コンサルタント、分析職', caution: '感情も大切に' },
    ];

    for (const sixStar of sixStarTypes) {
      await adminDb.sixStarMaster.upsert({
        where: { 
          star_plusminus: { 
            star: sixStar.star, 
            plusminus: sixStar.plusminus 
          } 
        },
        update: {},
        create: sixStar,
      });
    }

    console.log('✅ 管理者データベースの初期化が完了しました');
    console.log(`デフォルト管理者: admin / ${adminPassword}`);

  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    throw error;
  }
}