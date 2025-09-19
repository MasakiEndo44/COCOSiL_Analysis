'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import { CHAPTER_INFO } from '@/lib/zustand/learning-store';

export function TaihekiBreadcrumbs() {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      name: 'ホーム',
      href: '/',
      icon: Home,
    },
    {
      name: '体癖理論学習',
      href: '/learn/taiheki',
      icon: BookOpen,
    },
  ];

  // 章ページの場合は章情報を追加
  if (pathSegments.length >= 3 && pathSegments[2]) {
    const chapterId = pathSegments[2];
    const chapterInfo = CHAPTER_INFO[chapterId as keyof typeof CHAPTER_INFO];
    
    if (chapterInfo) {
      breadcrumbs.push({
        name: `第${chapterInfo.order}章: ${chapterInfo.title}`,
        href: `/learn/taiheki/${chapterId}`,
        icon: BookOpen,
      });
    }
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const IconComponent = breadcrumb.icon;
        
        return (
          <div key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            
            {isLast ? (
              <span className="flex items-center space-x-1 text-foreground font-medium">
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{breadcrumb.name}</span>
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="flex items-center space-x-1 hover:text-brand-600 transition-colors"
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{breadcrumb.name}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}