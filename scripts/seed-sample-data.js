const { PrismaClient } = require('@prisma/client');

const adminDb = new PrismaClient();

async function seedSampleData() {
  try {
    console.log('サンプル診断データの追加を開始...');

    const sampleRecords = [
      {
        date: '2025-08-20',
        name: '田中太郎',
        birthDate: '1990/05/15',
        age: 35,
        gender: 'male',
        zodiac: '牡牛座',
        animal: 'ライオン',
        orientation: 'big_vision_oriented',
        color: '金',
        mbti: 'ENTJ',
        mainTaiheki: 1,
        subTaiheki: 5,
        sixStar: '土星+',
        theme: 'キャリア,人間関係',
        advice: '大局的な視点を活かして、リーダーシップを発揮することで周囲との関係も良好になります。',
        satisfaction: 5,
        duration: '45分',
        feedback: '非常に的確なアドバイスでした。今後の方向性が見えました。',
        reportUrl: null,
        interviewScheduled: null,
        interviewDone: null,
        memo: '積極的で前向きな方',
      },
      {
        date: '2025-08-22',
        name: '佐藤花子',
        birthDate: '1995/03/08',
        age: 30,
        gender: 'female',
        zodiac: '魚座',
        animal: 'こじか',
        orientation: 'castle_oriented',
        color: '青',
        mbti: 'ISFP',
        mainTaiheki: 3,
        subTaiheki: 2,
        sixStar: '金星-',
        theme: '恋愛,自己理解',
        advice: '感受性豊かな特性を活かして、相手の気持ちを理解することで良い関係を築けます。',
        satisfaction: 4,
        duration: '50分',
        feedback: '自分の性格がよく分かりました。恋愛面でのアドバイスが参考になりました。',
        reportUrl: null,
        interviewScheduled: '2025-09-05',
        interviewDone: null,
        memo: '内向的だが芸術的センスがある',
      },
      {
        date: '2025-08-25',
        name: '山田次郎',
        birthDate: '1988/11/20',
        age: 36,
        gender: 'male',
        zodiac: '蠍座',
        animal: '虎',
        orientation: 'people_oriented',
        color: '赤',
        mbti: 'ESTP',
        mainTaiheki: 5,
        subTaiheki: 7,
        sixStar: '火星+',
        theme: 'キャリア,健康',
        advice: '行動力を活かしつつ、健康管理にも気を配ることで長期的な成功を掴めます。',
        satisfaction: 5,
        duration: '40分',
        feedback: '行動派の自分にピッタリのアドバイスでした。健康面も気をつけます。',
        reportUrl: null,
        interviewScheduled: null,
        interviewDone: null,
        memo: 'エネルギッシュで積極的',
      },
      {
        date: '2025-08-28',
        name: '中村美咲',
        birthDate: '2000/07/12',
        age: 25,
        gender: 'female',
        zodiac: '蟹座',
        animal: 'ひつじ',
        orientation: 'big_vision_oriented',
        color: '緑',
        mbti: 'INFJ',
        mainTaiheki: 2,
        subTaiheki: 6,
        sixStar: '木星-',
        theme: '将来,人間関係,自己理解',
        advice: '理想主義的な面を活かして、人々をサポートする役割で力を発揮できそうです。',
        satisfaction: 4,
        duration: '60分',
        feedback: '将来の方向性について考える良いきっかけになりました。',
        reportUrl: null,
        interviewScheduled: null,
        interviewDone: null,
        memo: '思慮深く、人のことを考える優しい方',
      },
      {
        date: '2025-08-30',
        name: '吉田健一',
        birthDate: '1985/12/03',
        age: 39,
        gender: 'male',
        zodiac: '射手座',
        animal: '猿',
        orientation: 'big_vision_oriented',
        color: '黄',
        mbti: 'ENTP',
        mainTaiheki: 8,
        subTaiheki: 10,
        sixStar: '天王星+',
        theme: 'キャリア,創造性',
        advice: '創造性と適応力を活かして、新しい分野にチャレンジすることで成長できます。',
        satisfaction: 5,
        duration: '35分',
        feedback: '新しいことに挑戦する勇気をもらいました。ありがとうございます。',
        reportUrl: null,
        interviewScheduled: null,
        interviewDone: null,
        memo: 'クリエイティブで柔軟な思考の持ち主',
      },
    ];

    for (const record of sampleRecords) {
      await adminDb.diagnosisRecord.create({
        data: record,
      });
    }

    console.log('✅ サンプル診断データの追加が完了しました');
    console.log(`追加レコード数: ${sampleRecords.length}件`);

  } catch (error) {
    console.error('❌ サンプルデータ追加エラー:', error);
    throw error;
  } finally {
    await adminDb.$disconnect();
  }
}

seedSampleData().catch(console.error);