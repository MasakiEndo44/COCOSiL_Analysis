import type { ChatMessage } from '@/types';

// Performance configuration constants
export const CHAT_PERFORMANCE_CONFIG = {
  MAX_MESSAGES_IN_CONTEXT: 20, // Maximum messages to send to OpenAI
  MAX_MESSAGES_FOR_STORAGE: 50, // Maximum messages to store locally
  CONTEXT_WINDOW_STRATEGY: 'sliding' as const, // 'sliding' | 'truncate'
  SUMMARY_TRIGGER_THRESHOLD: 30, // When to start summarizing older messages
} as const;

/**
 * Performance-optimized conversation windowing
 * Implements sliding window with summary preservation to prevent unlimited growth
 */
export function applyConversationWindowing(
  messages: ChatMessage[],
  maxMessages: number = CHAT_PERFORMANCE_CONFIG.MAX_MESSAGES_IN_CONTEXT
): {
  windowedMessages: ChatMessage[];
  droppedCount: number;
  contextInfo: {
    totalMessages: number;
    windowSize: number;
    compressionRatio: number;
  };
} {
  if (messages.length <= maxMessages) {
    return {
      windowedMessages: messages,
      droppedCount: 0,
      contextInfo: {
        totalMessages: messages.length,
        windowSize: messages.length,
        compressionRatio: 1.0
      }
    };
  }

  // Strategy: Keep recent messages + preserve conversation flow
  const recentMessages = messages.slice(-maxMessages);
  const droppedCount = messages.length - maxMessages;

  // Ensure we start with a user message if possible for better context
  let startIndex = 0;
  for (let i = 0; i < recentMessages.length; i++) {
    if (recentMessages[i].role === 'user') {
      startIndex = i;
      break;
    }
  }

  const optimizedMessages = recentMessages.slice(startIndex);
  const finalDroppedCount = messages.length - optimizedMessages.length;

  return {
    windowedMessages: optimizedMessages,
    droppedCount: finalDroppedCount,
    contextInfo: {
      totalMessages: messages.length,
      windowSize: optimizedMessages.length,
      compressionRatio: optimizedMessages.length / messages.length
    }
  };
}

/**
 * Calculate memory usage estimate for conversation storage
 */
export function estimateConversationMemoryUsage(messages: ChatMessage[]): {
  estimatedBytes: number;
  messageCount: number;
  averageMessageSize: number;
  isOverThreshold: boolean;
} {
  const jsonString = JSON.stringify(messages);
  const estimatedBytes = new Blob([jsonString]).size;
  const averageMessageSize = estimatedBytes / messages.length;
  
  // 5MB threshold for localStorage efficiency
  const STORAGE_THRESHOLD = 5 * 1024 * 1024;
  
  return {
    estimatedBytes,
    messageCount: messages.length,
    averageMessageSize,
    isOverThreshold: estimatedBytes > STORAGE_THRESHOLD
  };
}

/**
 * Optimize messages for localStorage storage
 * Applies compression strategies to reduce storage footprint
 */
export function optimizeMessagesForStorage(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= CHAT_PERFORMANCE_CONFIG.MAX_MESSAGES_FOR_STORAGE) {
    return messages;
  }

  // Keep recent messages and remove older ones
  return messages.slice(-CHAT_PERFORMANCE_CONFIG.MAX_MESSAGES_FOR_STORAGE);
}

/**
 * Generate conversation context summary for performance monitoring
 */
export function generateContextSummary(messages: ChatMessage[]): {
  messageCount: number;
  userMessages: number;
  assistantMessages: number;
  averageLength: number;
  estimatedTokens: number;
} {
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;
  const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
  const averageLength = Math.round(totalLength / messages.length);
  
  // Rough token estimation (1 token ≈ 4 characters for English/Japanese mix)
  const estimatedTokens = Math.round(totalLength / 3.5);
  
  return {
    messageCount: messages.length,
    userMessages,
    assistantMessages,
    averageLength,
    estimatedTokens
  };
}