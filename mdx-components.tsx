import type { MDXComponents } from 'mdx/types'
import { Card } from '@/ui/components/ui/card'
import { Button } from '@/ui/components/ui/button'
import { Progress } from '@/ui/components/ui/progress'
import { InteractiveQuiz } from '@/ui/components/interactive/interactive-quiz'
import { BodyTypeSelector } from '@/ui/components/interactive/body-type-selector'
import { TaihekiComparison } from '@/ui/components/interactive/taiheki-comparison'
import { ReflectionPrompt } from '@/ui/components/interactive/reflection-prompt'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allow customizing built-in components, e.g. to add styling.
    h1: ({ children }) => (
      <h1 className="text-h1-mobile md:text-h1-desktop font-heading text-foreground mb-6 border-b border-border pb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-h2-mobile md:text-h2-desktop font-heading text-foreground mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-h3-mobile md:text-h3-desktop font-heading text-foreground mb-3 mt-6">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-body-m-mobile md:text-body-m-desktop text-muted-foreground mb-4 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2 mb-4 list-disc pl-6 text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2 mb-4 list-decimal pl-6 text-body-m-mobile md:text-body-m-desktop text-muted-foreground">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-brand-200 bg-brand-50 pl-6 py-4 my-6 text-brand-700 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
        {children}
      </pre>
    ),
    
    // Interactive Components for Taiheki Learning
    Card: Card,
    Button: Button,
    Progress: Progress,
    InteractiveQuiz: InteractiveQuiz,
    BodyTypeSelector: BodyTypeSelector,
    TaihekiComparison: TaihekiComparison,
    ReflectionPrompt: ReflectionPrompt,
    
    // Custom learning components
    InfoBox: ({ children, type = 'info' }: { children: React.ReactNode, type?: 'info' | 'warning' | 'success' | 'tip' }) => {
      const styles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        tip: 'bg-purple-50 border-purple-200 text-purple-800'
      }
      
      return (
        <div className={`border rounded-lg p-4 my-4 ${styles[type]}`}>
          {children}
        </div>
      )
    },
    
    KeyPoint: ({ children, title }: { children: React.ReactNode, title?: string }) => (
      <Card className="p-4 my-4 bg-brand-50 border-brand-200">
        {title && <h4 className="font-semibold text-brand-800 mb-2">{title}</h4>}
        <div className="text-brand-700">{children}</div>
      </Card>
    ),
    
    Exercise: ({ children, title }: { children: React.ReactNode, title?: string }) => (
      <Card className="p-6 my-6 border-2 border-dashed border-orange-200 bg-orange-50">
        {title && <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
          <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs mr-2">
            ✏️
          </span>
          {title}
        </h4>}
        <div className="text-orange-700">{children}</div>
      </Card>
    ),

    Callout: ({ children, type = 'info' }: { children: React.ReactNode, type?: 'info' | 'warning' | 'success' | 'error' }) => {
      const styles = {
        info: 'bg-blue-50 border-blue-500 text-blue-900',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        success: 'bg-green-50 border-green-500 text-green-900',
        error: 'bg-red-50 border-red-500 text-red-900'
      }

      return (
        <div className={`border-l-4 rounded-r-lg p-4 my-4 ${styles[type]}`}>
          {children}
        </div>
      )
    },

    Warning: ({ children }: { children: React.ReactNode }) => (
      <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg p-4 my-4 text-yellow-900">
        <div className="flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    ),

    ...components,
  }
}