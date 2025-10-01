/**
 * Test helper factory for creating ChatMessage objects with required fields
 */

import { ChatMessage } from '@/types';

export function createTestMessage(
  partial: Pick<ChatMessage, 'role' | 'content'> & Partial<ChatMessage>
): ChatMessage {
  return {
    id: partial.id || `test-msg-${Date.now()}-${Math.random()}`,
    role: partial.role,
    content: partial.content,
    timestamp: partial.timestamp || new Date(),
  };
}

export function createTestMessages(
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
): ChatMessage[] {
  return messages.map((msg) => createTestMessage(msg));
}
