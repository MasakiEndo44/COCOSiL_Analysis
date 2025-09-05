const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const adminDb = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('管理者パスワードの更新を開始...');

    // .envからパスワード取得
    const adminPassword = process.env.ADMIN_PASSWORD || '5546';
    console.log(`新しいパスワード: ${adminPassword}`);

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // 既存の管理者を削除
    await adminDb.adminUser.deleteMany({
      where: { username: 'admin' }
    });

    // 新しい管理者アカウントを作成
    const newAdmin = await adminDb.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('✅ 管理者パスワードの更新が完了しました');
    console.log(`管理者ID: ${newAdmin.id}`);
    console.log(`ログイン情報: admin / ${adminPassword}`);

  } catch (error) {
    console.error('❌ パスワード更新エラー:', error);
    throw error;
  } finally {
    await adminDb.$disconnect();
  }
}

updateAdminPassword().catch(console.error);