# Q&A List Dynamic Display Design Specification

## Overview
Design specification for updating the final diagnosis results Q&A list to conditionally display content based on whether the user has completed AI counseling sessions.

## Current State Analysis

### Existing Implementation
- **Location**: `src/ui/features/diagnosis/results.tsx`
- **Current Behavior**: Shows static predefined consultation topics with generic responses
- **Data Source**: Hardcoded `consultationTopics` array with 4 categories
- **Response Logic**: Template-based responses using diagnosis results (MBTI, Taiheki, Fortune)

### Current Data Structure
```typescript
interface ConsultationTopic {
  id: string;           // 'relationship' | 'career' | 'personality' | 'future'  
  title: string;        // Display title in Japanese
  description: string;  // Question description
  icon: string;         // Emoji icon
}
```

## New Requirements

### Functional Requirements
1. **Conditional Display**: Q&A list should be blank if user has not completed AI counseling
2. **Dynamic Content**: If AI counseling completed, display summarized consultation content
3. **Data Persistence**: Need to detect and retrieve AI counseling session data
4. **Content Summarization**: Summarize actual consultation content instead of generic responses

## Design Specification

### 1. Data Structure Design

#### 1.1 AI Counseling Session Data
```typescript
interface ChatSession {
  sessionId: string;
  selectedTopic: string;          // Which consultation topic was chosen
  messages: ChatMessage[];       // Full conversation history
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  summary?: string;              // AI-generated summary
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSummary {
  topicId: string;
  topicTitle: string;
  qaExchanges: QAExchange[];     // Simple Q&A pairs
  sessionDuration: number;       // Duration in minutes
}

interface QAExchange {
  question: string;              // OpenAI question summary
  answer: string;                // User response summary
  timestamp: Date;               // When this exchange occurred
}
```

#### 1.2 Enhanced Diagnosis Store
```typescript
interface DiagnosisState {
  // ... existing fields
  chatSession: ChatSession | null;
  chatSummary: ChatSummary | null;
  hasCompletedCounseling: boolean;
}

interface DiagnosisActions {
  // ... existing actions
  setChatSession: (session: ChatSession) => void;
  setChatSummary: (summary: ChatSummary) => void;
  markCounselingCompleted: (completed: boolean) => void;
}
```

### 2. Storage Strategy

#### 2.1 LocalStorage Integration
```typescript
// Extend existing diagnosis store persistence
const diagnosisStorePersist = {
  name: 'cocosil-diagnosis-store',
  partialize: (state) => ({
    // ... existing fields
    chatSession: state.chatSession,
    chatSummary: state.chatSummary, 
    hasCompletedCounseling: state.hasCompletedCounseling
  })
}
```

#### 2.2 Data Retention Policy
- **Alignment**: Follow existing 30-day auto-deletion policy
- **Cleanup**: Counseling data deleted with diagnosis data
- **Privacy**: No server-side storage of personal counseling content

### 3. Conditional Display Logic

#### 3.1 Display Decision Tree
```
User accesses Final Results
├── hasCompletedCounseling === false
│   ├── Q&A Section: HIDDEN or EMPTY STATE
│   └── Message: "AIカウンセリングを利用すると、個別化されたアドバイスが表示されます"
└── hasCompletedCounseling === true
    ├── chatSummary exists
    │   ├── Display: Actual counseling summary
    │   └── Format: Topic + User concerns + AI advice
    └── chatSummary missing
        ├── Fallback: Generic responses (current behavior)
        └── Generate summary from chatSession.messages
```

#### 3.2 UI State Components
```typescript
// Three possible states for Q&A section
type QADisplayState = 
  | 'empty'           // No counseling completed
  | 'summarized'      // Counseling completed with summary
  | 'fallback'        // Counseling completed but no summary available
```

### 4. Content Summarization Algorithm

#### 4.1 Simple Q&A Summarization
```typescript
interface SummarizationOptions {
  maxLength: number;          // Max character length for summaries (default: 200)
  maxExchanges: number;       // Max number of Q&A pairs to extract (default: 5)
}

class SimpleCounselingSummarizer {
  summarizeSession(messages: ChatMessage[]): ChatSummary {
    const qaExchanges = this.extractQAExchanges(messages);
    
    return {
      topicId: this.getTopicId(messages),
      topicTitle: this.getTopicTitle(messages),
      qaExchanges: qaExchanges,
      sessionDuration: this.calculateDuration(messages)
    };
  }
  
  private extractQAExchanges(messages: ChatMessage[]): QAExchange[] {
    const exchanges: QAExchange[] = [];
    
    // Simple pattern: every assistant message followed by user message = one Q&A
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'assistant' && messages[i + 1].role === 'user') {
        exchanges.push({
          question: this.summarizeText(messages[i].content, 100), // Limit to 100 chars
          answer: this.summarizeText(messages[i + 1].content, 150), // Limit to 150 chars
          timestamp: messages[i].timestamp
        });
      }
    }
    
    return exchanges.slice(0, 5); // Max 5 exchanges
  }
  
  private summarizeText(text: string, maxLength: number): string {
    // Simple truncation with ellipsis if needed
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
```

#### 4.2 Fallback Summarization
```typescript
// If real-time summarization fails, use simple placeholder Q&A
const generateFallbackSummary = (selectedTopic: string, messageCount: number): ChatSummary => {
  const topicTemplates = {
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
    // ... other topics with simple placeholder Q&A
  };
  
  return {
    topicId: selectedTopic,
    topicTitle: getTopicTitle(selectedTopic),
    qaExchanges: topicTemplates[selectedTopic] || [],
    sessionDuration: Math.floor(messageCount * 1.5) // Estimate based on message count
  };
};
```

### 5. Implementation Architecture

#### 5.1 Component Flow
```
DiagnosisResults Component
├── useEffect: Check hasCompletedCounseling
├── Conditional Rendering
│   ├── hasCompletedCounseling === false
│   │   └── EmptyQAState Component
│   └── hasCompletedCounseling === true
│       ├── chatSummary exists
│       │   └── SummarizedQAList Component
│       └── chatSummary missing
│           ├── Generate summary from chatSession
│           └── FallbackQAList Component
```

#### 5.2 Data Flow
```
Chat Page (AI Counseling)
├── User completes counseling
├── Generate summary (client-side)
├── Save to diagnosis store
│   ├── chatSession: ChatSession
│   ├── chatSummary: ChatSummary  
│   └── hasCompletedCounseling: true
└── Persist to localStorage

Results Page (Q&A Display)
├── Load from diagnosis store
├── Check hasCompletedCounseling
├── Conditional rendering
└── Display appropriate content
```

### 6. UI/UX Specifications

#### 6.1 Empty State Design
```
┌─────────────────────────────────────┐
│ 💬 質問＆回答リスト                    │
├─────────────────────────────────────┤
│                                     │
│   🤖 AIカウンセリングを利用すると、   │
│      個別化されたアドバイスが        │
│      ここに表示されます               │
│                                     │
│   [AIカウンセリングを開始] ボタン      │
│                                     │
└─────────────────────────────────────┘
```

#### 6.2 Summarized Content Design
```
┌─────────────────────────────────────┐
│ 💬 AIカウンセリング要約              │
├─────────────────────────────────────┤
│ 相談カテゴリ: 👥 人間関係の悩み       │
│ セッション時間: 12分                 │
├─────────────────────────────────────┤
│ 📝 あなたの主な相談内容:             │
│ • 職場での上司との関係性             │
│ • チームメンバーとのコミュニケーション │
│ • 意見の伝え方について               │
├─────────────────────────────────────┤
│ 💡 AIからの主なアドバイス:           │
│ • ENFP特性を活かした積極的な対話      │
│ • 体癖3種の特徴を理解した関係構築    │
│ • 段階的なアプローチの実践           │
├─────────────────────────────────────┤
│ ✅ 推奨アクション:                   │
│ • 週1回の1on1実施                   │
│ • フィードバック方法の改善           │
└─────────────────────────────────────┘
```

### 7. Implementation Guidelines

#### 7.1 Phase 1: Data Structure Enhancement
1. Update `DiagnosisStore` with counseling fields
2. Extend localStorage persistence
3. Add counseling detection logic

#### 7.2 Phase 2: Chat Integration  
1. Modify chat page to save session data
2. Implement client-side summarization
3. Update store on counseling completion

#### 7.3 Phase 3: Results Display Update
1. Update `generateQAList` to be conditional
2. Implement empty state component
3. Implement summarized content display
4. Update clipboard copy functionality

#### 7.4 Phase 4: Testing & Validation
1. Test with/without counseling sessions
2. Validate data persistence across sessions
3. Verify privacy compliance (30-day deletion)

### 8. Technical Considerations

#### 8.1 Performance
- **Lazy Loading**: Only generate summaries when needed
- **Caching**: Cache generated summaries to avoid recomputation
- **Memory**: Limit message history storage to prevent memory issues

#### 8.2 Privacy & Security
- **Client-Only**: All counseling data remains client-side
- **Encryption**: Consider encrypting sensitive counseling content
- **Deletion**: Ensure complete cleanup after 30 days

#### 8.3 Error Handling
- **Summarization Failure**: Graceful fallback to generic responses
- **Data Corruption**: Validate stored data integrity
- **Missing Data**: Handle partial session data gracefully

### 9. Success Metrics

#### 9.1 Functional Metrics
- ✅ Empty state displays when no counseling completed
- ✅ Summarized content displays when counseling completed
- ✅ Data persists across browser sessions
- ✅ Privacy policy compliance maintained

#### 9.2 User Experience Metrics
- 📈 Improved relevance of Q&A content
- 📈 Better personalization of final results
- 📈 Clear guidance for users who haven't used counseling
- 📈 Seamless integration with existing diagnosis flow

---

This design specification provides a comprehensive plan for implementing conditional Q&A list display based on AI counseling completion status, ensuring both functionality and user privacy are maintained.