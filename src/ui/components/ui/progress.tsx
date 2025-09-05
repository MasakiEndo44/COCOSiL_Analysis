import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div
        ref={ref}
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          className
        )}
        {...props}
      >
        <div 
          className="bg-gradient-brand h-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };