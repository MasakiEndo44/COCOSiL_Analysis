# SuperClaude (/sc:) Command Codex Integration

This document defines the mandatory Codex integration pattern for all `/sc:` commands in the SuperClaude framework.

## Integration Requirement

**MANDATORY**: All `/sc:` commands must use the `mcp__codex__codex` tool at least once per execution based on user prompts.

## Implementation Pattern

### Shared Codex Helper Function (Pseudo-code)

```typescript
interface ScCommandContext {
  commandName: string;
  userInput: {
    raw: string;
    args: string[];
  };
  metadata: {
    codexCall?: any;
    [key: string]: any;
  };
  summary?: string;
}

export async function ensureCodexUsage(ctx: ScCommandContext): Promise<any> {
  // Return cached result if already called in this execution
  if (ctx.metadata.codexCall) {
    return ctx.metadata.codexCall;
  }

  // Build command-specific Codex prompt
  const prompt = buildCodexPrompt({
    command: ctx.commandName,
    userPrompt: ctx.userInput.raw,
    context: ctx.summary ?? '',
    timestamp: new Date().toISOString()
  });

  // Call Codex with the constructed prompt
  const result = await mcp__codex__codex({ prompt });

  // Cache the result to avoid redundant calls
  ctx.metadata.codexCall = result;

  return result;
}

function buildCodexPrompt(params: {
  command: string;
  userPrompt: string;
  context: string;
  timestamp: string;
}): string {
  return `SuperClaude ${params.command} Command - Codex Integration

User Request: ${params.userPrompt}
Context: ${params.context}
Timestamp: ${params.timestamp}

Please provide strategic guidance and optimization recommendations for executing this ${params.command} command based on the user's request. Focus on:
1. Implementation strategy and best practices
2. Potential optimizations and efficiency improvements
3. Risk assessment and mitigation strategies
4. Integration patterns with existing systems

Your response will inform the command execution to ensure optimal results.`;
}
```

## Command-Specific Implementation

### /sc:implement
```typescript
// Usage in /sc:implement command
async function executeImplementCommand(userPrompt: string) {
  const ctx: ScCommandContext = {
    commandName: 'sc:implement',
    userInput: { raw: userPrompt, args: parseArgs(userPrompt) },
    metadata: {},
    summary: 'Feature implementation with framework integration'
  };

  // MANDATORY: Call Codex first
  const codexGuidance = await ensureCodexUsage(ctx);

  // Use Codex guidance to inform implementation strategy
  const implementationPlan = createImplementationPlan(codexGuidance, ctx);

  // Proceed with standard implementation workflow
  return executeImplementation(implementationPlan);
}
```

### /sc:load
```typescript
// Usage in /sc:load command
async function executeLoadCommand(userPrompt: string) {
  const ctx: ScCommandContext = {
    commandName: 'sc:load',
    userInput: { raw: userPrompt, args: parseArgs(userPrompt) },
    metadata: {},
    summary: 'Session restoration and context analysis'
  };

  // MANDATORY: Call Codex first
  const codexGuidance = await ensureCodexUsage(ctx);

  // Use Codex guidance for session restoration strategy
  const restorationPlan = createRestorationPlan(codexGuidance, ctx);

  // Proceed with session loading
  return executeSessionLoad(restorationPlan);
}
```

### /sc:save
```typescript
// Usage in /sc:save command
async function executeSaveCommand(userPrompt: string) {
  const ctx: ScCommandContext = {
    commandName: 'sc:save',
    userInput: { raw: userPrompt, args: parseArgs(userPrompt) },
    metadata: {},
    summary: 'Session state optimization and persistence'
  };

  // MANDATORY: Call Codex first
  const codexGuidance = await ensureCodexUsage(ctx);

  // Use Codex guidance for optimal persistence strategy
  const persistencePlan = createPersistencePlan(codexGuidance, ctx);

  // Proceed with session saving
  return executeSessionSave(persistencePlan);
}
```

## Command Metadata Schema

Each `/sc:` command should include metadata to enforce the Codex requirement:

```typescript
interface ScCommandMetadata {
  codex: {
    required: true;
    promptBuilder: string; // e.g., 'implementPrompt', 'loadPrompt', 'savePrompt'
    called: boolean;
    result?: any;
  };
  version: string;
  lastUpdated: string;
}
```

## Testing Guidelines

### Unit Tests
```typescript
describe('SC Command Codex Integration', () => {
  it('should call Codex exactly once per command execution', async () => {
    const mockCodex = jest.fn().mockResolvedValue({ guidance: 'test' });

    const ctx = createTestContext('sc:implement', 'test user prompt');

    await ensureCodexUsage(ctx);
    await ensureCodexUsage(ctx); // Second call should use cache

    expect(mockCodex).toHaveBeenCalledTimes(1);
    expect(ctx.metadata.codexCall).toBeDefined();
  });

  it('should include user prompt in Codex call', async () => {
    const mockCodex = jest.fn().mockResolvedValue({ guidance: 'test' });

    const userPrompt = 'implement authentication system';
    const ctx = createTestContext('sc:implement', userPrompt);

    await ensureCodexUsage(ctx);

    const calledPrompt = mockCodex.mock.calls[0][0].prompt;
    expect(calledPrompt).toContain(userPrompt);
    expect(calledPrompt).toContain('sc:implement');
  });
});
```

### Integration Tests
```typescript
describe('SC Command Flow Integration', () => {
  it('should execute full command flow with Codex integration', async () => {
    const userPrompt = 'create React component with authentication';

    const result = await executeScImplement(userPrompt);

    // Verify Codex was called
    expect(result.codexGuidance).toBeDefined();

    // Verify implementation was informed by Codex
    expect(result.implementationStrategy).toContain('authentication');

    // Verify final output quality
    expect(result.success).toBe(true);
  });
});
```

## Error Handling

```typescript
export async function ensureCodexUsage(ctx: ScCommandContext): Promise<any> {
  try {
    if (ctx.metadata.codexCall) {
      return ctx.metadata.codexCall;
    }

    const prompt = buildCodexPrompt(ctx);
    const result = await mcp__codex__codex({ prompt });

    ctx.metadata.codexCall = result;
    return result;

  } catch (error) {
    console.error(`Codex integration failed for ${ctx.commandName}:`, error);

    // Fallback: continue with command but log the requirement violation
    ctx.metadata.codexCall = {
      error: 'Codex call failed',
      fallback: true,
      timestamp: new Date().toISOString()
    };

    // Re-throw for critical commands that require Codex
    if (ctx.commandName === 'sc:implement') {
      throw new Error(`Critical Codex integration failure for ${ctx.commandName}`);
    }

    return ctx.metadata.codexCall;
  }
}
```

## Compliance Validation

All `/sc:` commands must pass this validation:

```typescript
export function validateCodexCompliance(ctx: ScCommandContext): boolean {
  return (
    ctx.metadata.codexCall !== undefined &&
    ctx.metadata.codexCall !== null &&
    !ctx.metadata.codexCall.fallback
  );
}
```

## Implementation Checklist

- [ ] Command calls `ensureCodexUsage()` before primary execution
- [ ] User prompt is included in Codex call
- [ ] Result is cached to prevent duplicate calls
- [ ] Command metadata includes Codex requirement flag
- [ ] Unit tests verify single Codex call per execution
- [ ] Integration tests verify end-to-end flow
- [ ] Error handling includes fallback strategy
- [ ] Compliance validation passes

## Documentation Updates Required

1. **Global CLAUDE.md**: ✅ Updated with Codex requirement
2. **Command Reference Guide**: Update individual command docs
3. **Testing Standards**: Include Codex integration tests
4. **Error Handling Guide**: Document Codex failure scenarios