const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const adminDb = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('管理者アカウントの確認...');

    // 全管理者アカウントを取得
    const admins = await adminDb.adminUser.findMany();
    
    console.log(`管理者アカウント数: ${admins.length}`);
    
    for (const admin of admins) {
      console.log(`ID: ${admin.id}`);
      console.log(`ユーザー名: ${admin.username}`);
      console.log(`ロール: ${admin.role}`);
      console.log(`作成日時: ${admin.createdAt}`);
      console.log(`パスワードハッシュ: ${admin.password}`);
      
      // パスワード5546でのハッシュ比較テスト
      const isValid5546 = await bcrypt.compare('5546', admin.password);
      console.log(`パスワード'5546'での認証: ${isValid5546 ? '成功' : '失敗'}`);
      
      // パスワードadmin123でのハッシュ比較テスト
      const isValidAdmin123 = await bcrypt.compare('admin123', admin.password);
      console.log(`パスワード'admin123'での認証: ${isValidAdmin123 ? '成功' : '失敗'}`);
      
      console.log('---');
    }

  } catch (error) {
    console.error('❌ 確認エラー:', error);
  } finally {
    await adminDb.$disconnect();
  }
}

checkAdmin();