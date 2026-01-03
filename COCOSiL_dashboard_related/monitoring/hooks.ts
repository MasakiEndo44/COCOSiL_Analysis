/**
 * Monitoring Integration Hooks
 * Easy-to-use hooks for integrating monitoring throughout the application
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { monitor } from './index';
import type { UserAction } from './schema';

/**
 * Hook for automatic page view tracking
 */
export function usePageTracking() {
  const pathname = usePathname();
  const _router = useRouter();
  const previousPath = useRef<string>('');
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    // Track page view
    monitor.action('page_view');
    
    // Track route change if coming from another page
    if (previousPath.current && previousPath.current !== pathname) {
      const duration = Date.now() - pageStartTime.current;
      
      // Custom event for route change
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('route-change', {
          detail: {
            from: previousPath.current,
            to: pathname,
            duration,
          }
        }));
      }
    }
    
    previousPath.current = pathname;
    pageStartTime.current = Date.now();
  }, [pathname]);

  return {
    trackCustomEvent: (action: UserAction, result?: 'success' | 'error' | 'abandon') => {
      monitor.action(action, result);
    },
  };
}

/**
 * Hook for form interaction tracking
 */
export function useFormTracking(formName: string) {
  const startTime = useRef<number>(Date.now());
  const fieldInteractions = useRef<Record<string, number>>({});

  const trackFormStart = useCallback(() => {
    startTime.current = Date.now();
    monitor.action('form_submit', 'success'); // Form started
  }, []);

  const trackFieldFocus = useCallback((fieldName: string) => {
    if (!fieldInteractions.current[fieldName]) {
      fieldInteractions.current[fieldName] = Date.now();
    }
  }, []);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const duration = Date.now() - startTime.current;
    const result = success ? 'success' : 'error';
    
    monitor.action('form_submit', result);
    
    // Track form-specific metrics
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('form-complete', {
        detail: {
          formName,
          duration,
          success,
          errors: errors || [],
          fieldInteractions: Object.keys(fieldInteractions.current).length,
        }
      }));
    }
  }, [formName]);

  const trackFormAbandon = useCallback(() => {
    const duration = Date.now() - startTime.current;
    monitor.action('form_submit', 'abandon');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('form-abandon', {
        detail: {
          formName,
          duration,
          fieldInteractions: Object.keys(fieldInteractions.current).length,
        }
      }));
    }
  }, [formName]);

  return {
    trackFormStart,
    trackFieldFocus,
    trackFormSubmit,
    trackFormAbandon,
  };
}

/**
 * Hook for diagnosis flow tracking
 */
export function useDiagnosisTracking() {
  const stepStartTimes = useRef<Record<string, number>>({});

  const trackDiagnosisStart = useCallback((type: 'mbti' | 'taiheki' | 'fortune' | 'integrated') => {
    monitor.diagnosis(type, 'start', false, 0);
    stepStartTimes.current[type] = Date.now();
  }, []);

  const trackDiagnosisStep = useCallback((
    type: 'mbti' | 'taiheki' | 'fortune' | 'integrated',
    step: string,
    completed: boolean = false
  ) => {
    const startTime = stepStartTimes.current[`${type}-${step}`] || stepStartTimes.current[type] || Date.now();
    const duration = Date.now() - startTime;
    
    monitor.diagnosis(type, step, completed, duration);
    
    if (!completed) {
      stepStartTimes.current[`${type}-${step}`] = Date.now();
    }
  }, []);

  const trackDiagnosisComplete = useCallback((
    type: 'mbti' | 'taiheki' | 'fortune' | 'integrated',
    accuracy?: number
  ) => {
    const startTime = stepStartTimes.current[type];
    const duration = startTime ? Date.now() - startTime : 0;
    
    monitor.diagnosis(type, 'complete', true, duration);
    
    // Custom completion event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('diagnosis-complete', {
        detail: {
          type,
          duration,
          accuracy,
        }
      }));
    }
  }, []);

  return {
    trackDiagnosisStart,
    trackDiagnosisStep,
    trackDiagnosisComplete,
  };
}

/**
 * Hook for error boundary integration
 */
export function useErrorTracking() {
  const trackError = useCallback((
    error: Error,
    component?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    monitor.error(error, component, severity);
    
    // Additional error context
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('error-tracked', {
        detail: {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          component,
          severity,
          pathname: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  const trackRecovery = useCallback((
    error: Error,
    recoveryAction: string,
    successful: boolean
  ) => {
    // Track recovery attempt
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('error-recovery', {
        detail: {
          error: error.name,
          action: recoveryAction,
          successful,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  return {
    trackError,
    trackRecovery,
  };
}

/**
 * Hook for API call tracking
 */
export function useAPITracking() {
  const trackAPICall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>,
    options?: {
      expectedDuration?: number;
      retryCount?: number;
    }
  ): Promise<T> => {
    const startTime = Date.now();
    let error: string | undefined;
    let status = 200;

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      error = (err as Error).message;
      status = 500;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      monitor.api(endpoint, duration, status, error);

      // Track slow API calls
      if (options?.expectedDuration && duration > options.expectedDuration * 1.5) {
        monitor.error(
          new Error(`Slow API call: ${endpoint} took ${duration}ms`),
          'api-client',
          'medium'
        );
      }
    }
  }, []);

  return {
    trackAPICall,
  };
}

/**
 * Hook for chat interaction tracking
 */
export function useChatTracking() {
  const messageStartTime = useRef<number>(Date.now());
  const conversationStartTime = useRef<number>(Date.now());

  const trackMessageSent = useCallback((messageLength: number) => {
    messageStartTime.current = Date.now();
    
    monitor.action('chat_message');
    
    // Custom chat event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-message-sent', {
        detail: {
          messageLength,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  const trackMessageReceived = useCallback((
    responseLength: number,
    processingTime: number
  ) => {
    const userWaitTime = Date.now() - messageStartTime.current;
    
    // Custom chat response event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat-message-received', {
        detail: {
          responseLength,
          processingTime,
          userWaitTime,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  const trackConversationEnd = useCallback((messageCount: number, reason: 'complete' | 'abandon') => {
    const conversationDuration = Date.now() - conversationStartTime.current;
    
    monitor.action('chat_message', reason === 'complete' ? 'success' : 'abandon');
    
    // Custom conversation end event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('conversation-end', {
        detail: {
          duration: conversationDuration,
          messageCount,
          reason,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  return {
    trackMessageSent,
    trackMessageReceived,
    trackConversationEnd,
  };
}

/**
 * Hook for learning system tracking
 */
export function useLearningTracking() {
  const chapterStartTimes = useRef<Record<number, number>>({});

  const trackChapterStart = useCallback((chapterNumber: number) => {
    chapterStartTimes.current[chapterNumber] = Date.now();
    monitor.action('learn_chapter_view');
  }, []);

  const trackChapterComplete = useCallback((
    chapterNumber: number,
    score?: number,
    timeSpent?: number
  ) => {
    const startTime = chapterStartTimes.current[chapterNumber];
    const duration = timeSpent || (startTime ? Date.now() - startTime : 0);
    
    monitor.action('learn_chapter_complete', score && score >= 70 ? 'success' : 'error');
    
    // Custom learning event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chapter-complete', {
        detail: {
          chapterNumber,
          duration,
          score,
          timestamp: Date.now(),
        }
      }));
    }
  }, []);

  return {
    trackChapterStart,
    trackChapterComplete,
  };
}

/**
 * Global event listener setup for custom monitoring events
 */
export function useMonitoringEventListeners() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomEvents = (event: CustomEvent) => {
      // Log custom events for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Monitoring]', event.type, event.detail);
      }
    };

    // Add listeners for all custom events
    const eventTypes = [
      'route-change',
      'form-complete',
      'form-abandon',
      'diagnosis-complete',
      'error-tracked',
      'error-recovery',
      'chat-message-sent',
      'chat-message-received',
      'conversation-end',
      'chapter-complete',
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleCustomEvents as EventListener);
    });

    // Cleanup
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleCustomEvents as EventListener);
      });
    };
  }, []);
}