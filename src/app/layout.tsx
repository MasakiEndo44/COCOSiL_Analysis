import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'], 
  variable: '--font-noto-sans-jp' 
});

export const metadata: Metadata = {
  title: 'COCOSiL（ココシル）| 統合診断分析システム',
  description: '体癖理論・MBTI・算命学・動物占いを統合した包括的な人間理解プラットフォーム',
  keywords: ['体癖', 'MBTI', '算命学', '動物占い', '診断', '性格分析'],
  openGraph: {
    title: 'COCOSiL（ココシル）| 統合診断分析システム',
    description: '体癖理論・MBTI・算命学・動物占いを統合した包括的な人間理解プラットフォーム',
    type: 'website',
    locale: 'ja_JP',
  },
  robots: {
    index: false, // 検証段階のため非公開
    follow: false
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <div id="root" className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          {children}
        </div>
        <div id="modal-root" />
      </body>
    </html>
  );
}