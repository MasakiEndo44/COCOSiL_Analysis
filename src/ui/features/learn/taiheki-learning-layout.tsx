'use client';

import { useState } from 'react';
import { TaihekiNavigationSidebar } from './taiheki-navigation-sidebar';
import { TaihekiBreadcrumbs } from './taiheki-breadcrumbs';
import { BottomStepperNav } from '@/ui/components/learn/bottom-stepper-nav';
import { Button } from '@/ui/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-media-query';

interface TaihekiLearningLayoutProps {
  children: React.ReactNode;
}

export function TaihekiLearningLayout({ children }: TaihekiLearningLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background pb-safe-bottom">{/* モバイルボトムナビ分の余白 */}
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-border">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between lg:justify-start">
            {/* Mobile Menu Toggle */}
            <Button
              variant="tertiary"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            <TaihekiBreadcrumbs />
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-0
          w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block
        `}>
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            <TaihekiNavigationSidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className={`container-responsive py-8 ${isMobile ? 'pb-24' : ''}`}>
            {/* モバイル時はボトムナビ分の余白 */}
            {children}
          </div>
        </main>
      </div>

      {/* 🆕 モバイルボトムナビゲーション */}
      {isMobile && <BottomStepperNav />}
    </div>
  );
}