'use client';

import { TaihekiNavigationSidebar } from './taiheki-navigation-sidebar';
import { TaihekiBreadcrumbs } from './taiheki-breadcrumbs';

interface TaihekiLearningLayoutProps {
  children: React.ReactNode;
}

export function TaihekiLearningLayout({ children }: TaihekiLearningLayoutProps) {
  return (
    <ComponentTag name="TaihekiLearningLayout" type="layout">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border">
          <div className="container-responsive py-4">
            <TaihekiBreadcrumbs />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 h-[calc(100vh-5rem)]">
              <TaihekiNavigationSidebar />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="container-responsive py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ComponentTag>
  );
}