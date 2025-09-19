# Q&A Summarization Implementation Workflow

## Overview
Implementation plan for conditional Q&A list display based on AI counseling completion status. This workflow transforms the final diagnosis results to show either empty state or actual consultation summaries.

## Implementation Analysis

### Current State
- **Location**: `src/ui/features/diagnosis/results.tsx`
- **Current Behavior**: Static hardcoded Q&A list with generic responses
- **Existing Store**: `src/lib/zustand/diagnosis-store.ts` (no counseling data)
- **Chat System**: `src/app/diagnosis/chat/page.tsx` (exists but doesn't save data)

### Target Architecture
```
DiagnosisStore (Extended)
├── chatSession: ChatSession | null
├── chatSummary: ChatSummary | null  
└── hasCompletedCounseling: boolean

Results Component (Enhanced)
├── Conditional Logic: hasCompletedCounseling check
├── Empty State: No counseling message + start button
├── Summarized State: Simple Q&A pairs display
└── Fallback State: Generate from chatSession if summary missing
```

## Phase-Based Implementation Plan

### Phase 1: Data Structure Foundation (4 tasks, ~2 hours)

#### Task 1.1: Extend TypeScript Interfaces
**File**: `src/types/index.ts`
**Dependencies**: None
**Action**: Add new interfaces
```typescript
// Add to existing types
interface ChatSession {
  sessionId: string;
  selectedTopic: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

interface ChatSummary {
  topicId: string;
  topicTitle: string;
  qaExchanges: QAExchange[];
  sessionDuration: number;
}

interface QAExchange {
  question: string;    // OpenAI question summary (max 100 chars)
  answer: string;      // User response summary (max 150 chars)
  timestamp: Date;
}
```

#### Task 1.2: Extend Diagnosis Store
**File**: `src/lib/zustand/diagnosis-store.ts`
**Dependencies**: Task 1.1 (new types)
**Action**: Add counseling state and actions
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

#### Task 1.3: Update Store Persistence
**File**: `src/lib/zustand/diagnosis-store.ts`
**Dependencies**: Task 1.2 (extended store)
**Action**: Extend partialize function
```typescript
partialize: (state) => ({
  // ... existing fields
  chatSession: state.chatSession,
  chatSummary: state.chatSummary,
  hasCompletedCounseling: state.hasCompletedCounseling
})
```

#### Task 1.4: Create Summarization Utility
**File**: `src/lib/counseling/summarizer.ts` (new file)
**Dependencies**: Task 1.1 (types)
**Action**: Simple Q&A extraction algorithm
```typescript
export const extractQAExchanges = (messages: ChatMessage[]): QAExchange[] => {
  const exchanges: QAExchange[] = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === 'assistant' && messages[i + 1].role === 'user') {
      exchanges.push({
        question: summarizeText(messages[i].content, 100),
        answer: summarizeText(messages[i + 1].content, 150),
        timestamp: messages[i].timestamp
      });
    }
  }
  
  return exchanges.slice(0, 5); // Max 5 exchanges
};
```

### Phase 2: Chat Integration (3 tasks, ~3 hours)

#### Task 2.1: Update Chat Page Session Tracking
**File**: `src/app/diagnosis/chat/page.tsx`
**Dependencies**: Phase 1 complete
**Action**: Track session data during chat
```typescript
// Add to existing state
const [chatSession, setChatSession] = useState<ChatSession | null>(null);

// Initialize session when topic selected
const handleTopicSelect = (topicId: string) => {
  const session: ChatSession = {
    sessionId: generateSessionId(),
    selectedTopic: topicId,
    messages: [...messages],
    startTime: new Date(),
    isCompleted: false
  };
  setChatSession(session);
  // ... existing logic
};
```

#### Task 2.2: Implement Session Data Saving
**File**: `src/app/diagnosis/chat/page.tsx`
**Dependencies**: Task 2.1 (session tracking)
**Action**: Save to store on completion
```typescript
const handleEndConsultation = () => {
  if (chatSession && messages.length > 2) {
    const completedSession: ChatSession = {
      ...chatSession,
      messages: messages,
      endTime: new Date(),
      isCompleted: true
    };
    
    // Generate summary
    const summary = generateSessionSummary(completedSession);
    
    // Save to store
    setChatSession(completedSession);
    setChatSummary(summary);
    markCounselingCompleted(true);
  }
  
  router.push('/diagnosis/results');
};
```

#### Task 2.3: Create Summary Generation Function
**File**: `src/lib/counseling/summarizer.ts`
**Dependencies**: Task 1.4 (base utility)
**Action**: Complete summarization logic
```typescript
export const generateSessionSummary = (session: ChatSession): ChatSummary => {
  const qaExchanges = extractQAExchanges(session.messages);
  const duration = Math.floor(
    (session.endTime!.getTime() - session.startTime.getTime()) / (1000 * 60)
  );
  
  return {
    topicId: session.selectedTopic,
    topicTitle: getTopicTitle(session.selectedTopic),
    qaExchanges,
    sessionDuration: duration
  };
};
```

### Phase 3: Results Display Update (4 tasks, ~4 hours)

#### Task 3.1: Create Empty State Component
**File**: `src/ui/components/counseling/empty-qa-state.tsx` (new file)
**Dependencies**: None
**Action**: Empty state UI component
```typescript
export const EmptyQAState = () => (
  <div className="bg-white rounded-lg border border-border p-8 text-center">
    <h3 className="text-lg font-semibold mb-4">💬 質問＆回答リスト</h3>
    <div className="py-8 space-y-4">
      <p className="text-muted-foreground">
        🤖 AIカウンセリングを利用すると、<br/>
        個別化されたアドバイスが<br/>
        ここに表示されます
      </p>
      <Link href="/diagnosis/chat">
        <Button>AIカウンセリングを開始</Button>
      </Link>
    </div>
  </div>
);
```

#### Task 3.2: Create Summarized Q&A Component
**File**: `src/ui/components/counseling/summarized-qa-list.tsx` (new file)
**Dependencies**: Task 1.1 (types)
**Action**: Summary display component
```typescript
interface Props {
  summary: ChatSummary;
}

export const SummarizedQAList = ({ summary }: Props) => (
  <div className="bg-white rounded-lg border border-border">
    <div className="p-4 border-b border-border">
      <h3 className="text-lg font-semibold">💬 AIカウンセリング記録</h3>
      <p className="text-sm text-muted-foreground mt-1">
        相談カテゴリ: {getTopicIcon(summary.topicId)} {summary.topicTitle}
      </p>
    </div>
    
    <div className="p-4 space-y-6">
      {summary.qaExchanges.map((exchange, index) => (
        <div key={index} className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Q{index + 1}: {exchange.question}
            </p>
            <p className="text-sm text-muted-foreground">
              A{index + 1}: {exchange.answer}
            </p>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-border text-xs text-muted-foreground">
        ※ Claude向け要約: 全{summary.qaExchanges.length}回のやり取り
      </div>
    </div>
  </div>
);
```

#### Task 3.3: Update Main Results Component
**File**: `src/ui/features/diagnosis/results.tsx`
**Dependencies**: Tasks 3.1, 3.2 (components)
**Action**: Add conditional rendering logic
```typescript
import { EmptyQAState } from '@/ui/components/counseling/empty-qa-state';
import { SummarizedQAList } from '@/ui/components/counseling/summarized-qa-list';

// Replace generateQAList section with conditional logic
const renderQASection = () => {
  const { chatSummary, hasCompletedCounseling } = useDiagnosisStore();
  
  if (!hasCompletedCounseling) {
    return <EmptyQAState />;
  }
  
  if (chatSummary) {
    return <SummarizedQAList summary={chatSummary} />;
  }
  
  // Fallback: show generic responses (current behavior)
  return <div>{/* existing generateQAList logic */}</div>;
};

// Replace Q&A section in JSX
{renderQASection()}
```

#### Task 3.4: Update Clipboard Copy Function
**File**: `src/ui/features/diagnosis/results.tsx`
**Dependencies**: Task 3.3 (conditional rendering)
**Action**: Include counseling summary in clipboard
```typescript
const generateClipboardText = (): string => {
  // ... existing logic
  
  // Q&A section update
  if (hasCompletedCounseling && chatSummary) {
    content += '\n## AIカウンセリング記録\n\n';
    content += `**相談カテゴリ**: ${chatSummary.topicTitle}\n`;
    content += `**セッション時間**: ${chatSummary.sessionDuration}分\n\n`;
    
    chatSummary.qaExchanges.forEach((exchange, index) => {
      content += `**Q${index + 1}**: ${exchange.question}\n`;
      content += `**A${index + 1}**: ${exchange.answer}\n\n`;
    });
  } else if (!hasCompletedCounseling) {
    content += '\n## 質問＆回答リスト\n\n';
    content += 'AIカウンセリングを利用すると、個別化されたアドバイスがここに表示されます。\n\n';
  }
  
  // ... rest of existing logic
};
```

### Phase 4: Testing & Validation (3 tasks, ~2 hours)

#### Task 4.1: Create Test Scenarios
**File**: `src/__tests__/counseling/qa-summarization.test.ts` (new file)
**Dependencies**: All previous phases
**Action**: Unit tests for summarization logic
```typescript
describe('QA Summarization', () => {
  test('extractQAExchanges handles assistant-user pairs', () => {
    const messages = [
      { role: 'assistant', content: 'Question about relationships?', timestamp: new Date() },
      { role: 'user', content: 'I have communication issues with colleagues', timestamp: new Date() }
    ];
    
    const exchanges = extractQAExchanges(messages);
    expect(exchanges).toHaveLength(1);
    expect(exchanges[0].question).toContain('relationships');
    expect(exchanges[0].answer).toContain('communication issues');
  });
});
```

#### Task 4.2: Integration Testing
**File**: `src/__tests__/features/diagnosis-results.test.tsx` (extend existing)
**Dependencies**: Task 4.1 (test scenarios)
**Action**: Test conditional rendering
```typescript
describe('Diagnosis Results - QA Section', () => {
  test('shows empty state when no counseling completed', () => {
    const store = createMockStore({ hasCompletedCounseling: false });
    render(<DiagnosisResults />, { wrapper: StoreProvider(store) });
    
    expect(screen.getByText('AIカウンセリングを利用すると')).toBeInTheDocument();
    expect(screen.getByText('AIカウンセリングを開始')).toBeInTheDocument();
  });
  
  test('shows summarized content when counseling completed', () => {
    const mockSummary = {
      topicId: 'relationship',
      topicTitle: '人間関係の悩み',
      qaExchanges: [
        { question: 'Test question', answer: 'Test answer', timestamp: new Date() }
      ],
      sessionDuration: 15
    };
    const store = createMockStore({ 
      hasCompletedCounseling: true, 
      chatSummary: mockSummary 
    });
    
    render(<DiagnosisResults />, { wrapper: StoreProvider(store) });
    expect(screen.getByText('AIカウンセリング記録')).toBeInTheDocument();
    expect(screen.getByText('Test question')).toBeInTheDocument();
  });
});
```

#### Task 4.3: Data Persistence Validation
**File**: `src/__tests__/zustand/diagnosis-store.test.ts` (extend existing)
**Dependencies**: Task 4.2 (integration tests)
**Action**: Test localStorage persistence
```typescript
describe('Diagnosis Store - Counseling Data', () => {
  test('persists counseling data to localStorage', () => {
    const { result } = renderHook(() => useDiagnosisStore());
    
    const mockSession: ChatSession = {
      sessionId: 'test-123',
      selectedTopic: 'relationship',
      messages: [],
      startTime: new Date(),
      isCompleted: true
    };
    
    act(() => {
      result.current.setChatSession(mockSession);
      result.current.markCounselingCompleted(true);
    });
    
    // Verify localStorage contains counseling data
    const stored = JSON.parse(localStorage.getItem('cocosil-diagnosis-store')!);
    expect(stored.state.hasCompletedCounseling).toBe(true);
    expect(stored.state.chatSession.sessionId).toBe('test-123');
  });
});
```

## Technical Dependencies & Integration Points

### Critical Dependencies
```
Phase 1 → Phase 2 (types and store must exist before chat integration)
Phase 2 → Phase 3 (session data must be saved before results display)
Phase 3 → Phase 4 (components must exist before testing)
```

### External Integrations
- **OpenAI Chat API**: Already exists, no changes needed
- **Zustand Store**: Extend existing store, maintain compatibility
- **LocalStorage**: Use existing persistence layer
- **Results Component**: Enhance existing component, preserve clipboard functionality

### File Creation Summary
```
New Files:
- src/lib/counseling/summarizer.ts (utilities)
- src/ui/components/counseling/empty-qa-state.tsx
- src/ui/components/counseling/summarized-qa-list.tsx
- src/__tests__/counseling/qa-summarization.test.ts

Modified Files:
- src/types/index.ts (extend interfaces)
- src/lib/zustand/diagnosis-store.ts (add counseling state)
- src/app/diagnosis/chat/page.tsx (save session data)
- src/ui/features/diagnosis/results.tsx (conditional rendering)
- src/__tests__/features/diagnosis-results.test.tsx (extend tests)
- src/__tests__/zustand/diagnosis-store.test.ts (extend tests)
```

## Risk Assessment & Mitigation

### High Risk
- **Data Loss**: Counseling session not saved properly
  - **Mitigation**: Add validation before navigation, localStorage backup
- **Performance**: Large message arrays in localStorage
  - **Mitigation**: Limit to 5 Q&A pairs, implement compression

### Medium Risk  
- **UI/UX Disruption**: Empty state confuses users
  - **Mitigation**: Clear messaging, prominent start button
- **Type Errors**: Interface mismatches during integration
  - **Mitigation**: Strict TypeScript validation, comprehensive testing

### Low Risk
- **Privacy Concerns**: Counseling data exposure
  - **Mitigation**: Client-side only, maintain 30-day deletion policy

## Success Criteria

### Functional Requirements ✓
- [ ] Empty Q&A state displays when hasCompletedCounseling = false
- [ ] Summarized Q&A displays when counseling completed with summary
- [ ] Fallback to generic responses when summary generation fails
- [ ] Data persists across browser sessions
- [ ] Counseling data respects 30-day deletion policy

### Technical Requirements ✓
- [ ] No breaking changes to existing diagnosis flow
- [ ] Maintains existing clipboard copy functionality
- [ ] All TypeScript types validate without errors
- [ ] Unit test coverage ≥80% for new components
- [ ] Integration tests verify conditional rendering

### Performance Requirements ✓
- [ ] Results page loads within 500ms with counseling data
- [ ] Summary generation completes within 100ms
- [ ] LocalStorage operations complete within 50ms
- [ ] No memory leaks from large message arrays

## Estimated Timeline

**Total Duration**: 11 hours across 14 tasks
- **Phase 1 (Foundation)**: 4 tasks, ~2 hours
- **Phase 2 (Chat Integration)**: 3 tasks, ~3 hours  
- **Phase 3 (Results Display)**: 4 tasks, ~4 hours
- **Phase 4 (Testing)**: 3 tasks, ~2 hours

**Recommended Approach**: Complete phases sequentially, test after each phase to ensure stability.

---

This implementation workflow provides a comprehensive plan for transforming the Q&A list from static content to dynamic, counseling-based summaries while maintaining privacy, performance, and user experience standards.