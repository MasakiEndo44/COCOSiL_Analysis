'use client';

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/ui/dialog';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  'data-testid'?: string;
}

interface GuidanceOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string | ReactNode;
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  tone?: 'welcome' | 'instruction' | 'info';
  illustration?: ReactNode;
}

export function GuidanceOverlay({
  open,
  onClose,
  title,
  body,
  primaryAction,
  secondaryAction,
  tone = 'info',
  illustration
}: GuidanceOverlayProps) {
  const getToneClasses = () => {
    switch (tone) {
      case 'welcome':
        return {
          container: 'border-green-200 bg-green-50/80',
          title: 'text-green-800',
          body: 'text-green-700'
        };
      case 'instruction':
        return {
          container: 'border-blue-200 bg-blue-50/80',
          title: 'text-blue-800',
          body: 'text-blue-700'
        };
      default:
        return {
          container: 'border-gray-200 bg-white',
          title: 'text-gray-800',
          body: 'text-gray-700'
        };
    }
  };

  const toneClasses = getToneClasses();

  const getButtonVariant = (variant: ActionButton['variant']) => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'tertiary':
        return 'tertiary';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        className={`max-w-md sm:max-w-lg ${toneClasses.container} border-2 shadow-xl`}
        containerClassName="z-[70]"
        hideCloseButton={true}
        aria-modal="true"
        aria-labelledby="guidance-overlay-title"
        aria-describedby="guidance-overlay-description"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="閉じる"
          data-testid="guidance-overlay-close"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </button>

        <DialogHeader className="space-y-3 pr-8">
          {/* Illustration */}
          {illustration && (
            <div className="flex justify-center mb-4">
              {illustration}
            </div>
          )}

          {/* Title */}
          <DialogTitle
            id="guidance-overlay-title"
            className={`text-xl font-bold ${toneClasses.title}`}
          >
            {title}
          </DialogTitle>

          {/* Body */}
          <DialogDescription
            id="guidance-overlay-description"
            className={`text-base leading-relaxed ${toneClasses.body}`}
            asChild={typeof body !== 'string'}
          >
            {typeof body === 'string' ? (
              <div>{body}</div>
            ) : (
              body
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
            {/* Secondary Action (Left on desktop, Bottom on mobile) */}
            {secondaryAction && (
              <Button
                variant={getButtonVariant(secondaryAction.variant)}
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
                data-testid={secondaryAction['data-testid']}
              >
                {secondaryAction.label}
              </Button>
            )}

            {/* Primary Action (Right on desktop, Top on mobile) */}
            {primaryAction && (
              <Button
                variant={getButtonVariant(primaryAction.variant)}
                onClick={primaryAction.onClick}
                className="w-full sm:w-auto sm:ml-auto"
                data-testid={primaryAction['data-testid']}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}