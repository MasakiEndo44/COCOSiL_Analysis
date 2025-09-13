import type { ChatMessage, ChatSession, ChatSummary, QAExchange } from '@/types';

interface SummarizationOptions {
  maxLength: number;          // Max character length for summaries (default: 200)
  maxExchanges: number;       // Max number of Q&A pairs to extract (default: 5)
}

const defaultOptions: SummarizationOptions = {
  maxLength: 200,
  maxExchanges: 5
};

/**
 * Summarize text content with character limit
 */
export const summarizeText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Extract Q&A exchanges from chat messages
 * Pattern: assistant message followed by user message = one Q&A
 */
export const extractQAExchanges = (
  messages: ChatMessage[], 
  options: Partial<SummarizationOptions> = {}
): QAExchange[] => {
  const opts = { ...defaultOptions, ...options };
  const exchanges: QAExchange[] = [];
  
  // Simple pattern: every assistant message followed by user message = one Q&A
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'assistant' && messages[i + 1].role === 'user') {
      exchanges.push({
        question: summarizeText(messages[i].content, 100), // Limit to 100 chars
        answer: summarizeText(messages[i + 1].content, 150), // Limit to 150 chars
        timestamp: messages[i].timestamp
      });
    }
  }
  
  return exchanges.slice(0, opts.maxExchanges);
};

/**
 * Get consultation topic title from topic ID
 */
export const getTopicTitle = (topicId: string): string => {
  const topicTitles: Record<string, string> = {
    'relationship': '人間関係の悩み',
    'career': 'キャリア・仕事の悩み',
    'personality': '自分の性格・特性理解',
    'future': '将来・目標設定'
  };
  
  return topicTitles[topicId] || 'その他の相談';
};

/**
 * Get consultation topic icon from topic ID
 */
export const getTopicIcon = (topicId: string): string => {
  const topicIcons: Record<string, string> = {
    'relationship': '👥',
    'career': '💼',
    'personality': '🧠',
    'future': '🎯'
  };
  
  return topicIcons[topicId] || '💬';
};

/**
 * Calculate session duration in minutes
 */
export const calculateSessionDuration = (startTime: Date, endTime: Date): number => {
  return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};

/**
 * Generate comprehensive session summary
 */
export const generateSessionSummary = (
  session: ChatSession,
  options: Partial<SummarizationOptions> = {}
): ChatSummary => {
  const qaExchanges = extractQAExchanges(session.messages, options);
  const duration = session.endTime 
    ? calculateSessionDuration(session.startTime, session.endTime)
    : Math.floor(session.messages.length * 1.5); // Estimate based on message count
  
  return {
    topicId: session.selectedTopic,
    topicTitle: getTopicTitle(session.selectedTopic),
    qaExchanges,
    sessionDuration: duration
  };
};

/**
 * Generate fallback summary for failed summarization
 */
export const generateFallbackSummary = (
  selectedTopic: string, 
  messageCount: number
): ChatSummary => {
  const topicTemplates: Record<string, QAExchange[]> = {
    'relationship': [
      {
        question: 'どのような人間関係の悩みがありますか？',
        answer: 'コミュニケーションや職場での関係について相談しました',
        timestamp: new Date()
      }
    ],
    'career': [
      {
        question: 'キャリアについてどんな悩みがありますか？',
        answer: '転職や働き方について相談しました',
        timestamp: new Date()
      }
    ],
    'personality': [
      {
        question: '自分の性格についてどう思われますか？',
        answer: '特性理解や改善について相談しました',
        timestamp: new Date()
      }
    ],
    'future': [
      {
        question: '将来についてどのような目標がありますか？',
        answer: '目標設定や人生設計について相談しました',
        timestamp: new Date()
      }
    ]
  };
  
  return {
    topicId: selectedTopic,
    topicTitle: getTopicTitle(selectedTopic),
    qaExchanges: topicTemplates[selectedTopic] || [],
    sessionDuration: Math.floor(messageCount * 1.5) // Estimate based on message count
  };
};

/**
 * Validate session data before summarization
 */
export const validateSessionForSummary = (session: ChatSession): boolean => {
  if (!session || !session.messages || session.messages.length < 2) {
    return false;
  }
  
  // At least one assistant-user exchange should exist
  return session.messages.some((msg, index) => 
    msg.role === 'assistant' && 
    index < session.messages.length - 1 &&
    session.messages[index + 1].role === 'user'
  );
};