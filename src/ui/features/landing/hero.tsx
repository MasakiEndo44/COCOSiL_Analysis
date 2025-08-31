import { Button } from '@/ui/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Shield, Zap } from 'lucide-react';

export function LandingHero() {
  return (
    <div className="text-center space-y-8">
      {/* Logo/Title */}
      <div className="space-y-4">
        <div className="w-32 h-32 mx-auto bg-gradient-brand rounded-3xl flex items-center justify-center mb-8">
          <span className="text-white text-4xl font-bold">C</span>
        </div>
        <h1 className="text-h1-mobile md:text-h1-desktop font-bold text-foreground">
          COCOSiL<br />
          <span className="text-brand-500">（ココシル）</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          体癖理論・MBTI・算命学・動物占いを統合した<br />
          包括的な人間理解プラットフォーム
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="icon text-blue-600" />
          </div>
          <h3 className="text-h3-mobile font-bold text-foreground mb-2">科学的診断</h3>
          <p className="text-muted-foreground">
            複数の診断手法を統合した包括的な分析
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="icon text-purple-600" />
          </div>
          <h3 className="text-h3-mobile font-bold text-foreground mb-2">プライバシー保護</h3>
          <p className="text-muted-foreground">
            個人データを30日後に自動削除
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="icon text-green-600" />
          </div>
          <h3 className="text-h3-mobile font-bold text-foreground mb-2">即時結果</h3>
          <p className="text-muted-foreground">
            診断完了後すぐに結果を確認
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-8">
        <Link href="/diagnosis">
          <Button size="lg" className="text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
            診断を始める
          </Button>
        </Link>
      </div>

      {/* Additional Info */}
      <div className="pt-4">
        <p className="text-sm text-secondary-foreground">
          診断時間：約15-20分 | 完全無料
        </p>
      </div>
    </div>
  );
}