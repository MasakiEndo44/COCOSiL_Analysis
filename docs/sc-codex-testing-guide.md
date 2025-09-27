# SuperClaude /sc: Command Codex Integration - Testing Guide

## Overview

This guide provides comprehensive testing strategies for validating the mandatory Codex integration across all `/sc:` commands in the SuperClaude framework.

## Testing Requirements

### Unit Testing Requirements

All `/sc:` commands must pass these core integration tests:

#### 1. Mandatory Codex Call Validation
```typescript
describe('Codex Integration Requirement', () => {
  test('should call Codex exactly once per command execution', async () => {
    // Arrange
    const mockCodex = jest.fn().mockResolvedValue({
      guidance: 'test guidance',
      strategy: 'implementation strategy'
    });

    const ctx = createMockScContext('sc:implement', 'test user prompt');

    // Act
    await executeScCommand(ctx);
    await executeScCommand(ctx); // Second call should use cache

    // Assert
    expect(mockCodex).toHaveBeenCalledTimes(1);
    expect(ctx.metadata.codexCall).toBeDefined();
    expect(ctx.metadata.codexCall.fallback).toBeUndefined();
  });

  test('should include user prompt in Codex call', async () => {
    // Arrange
    const mockCodex = jest.fn().mockResolvedValue({ guidance: 'test' });
    const userPrompt = 'implement authentication system with JWT';
    const ctx = createMockScContext('sc:implement', userPrompt);

    // Act
    await executeScCommand(ctx);

    // Assert
    const calledPrompt = mockCodex.mock.calls[0][0].prompt;
    expect(calledPrompt).toContain(userPrompt);
    expect(calledPrompt).toContain('sc:implement');
    expect(calledPrompt).toContain('SuperClaude');
  });

  test('should cache Codex result within single execution', async () => {
    // Arrange
    const mockCodex = jest.fn().mockResolvedValue({ guidance: 'cached' });
    const ctx = createMockScContext('sc:implement', 'test prompt');

    // Act
    const result1 = await ensureCodexUsage(ctx);
    const result2 = await ensureCodexUsage(ctx);

    // Assert
    expect(mockCodex).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
    expect(ctx.metadata.codexCall).toBe(result1);
  });
});
```

#### 2. Command-Specific Prompt Validation
```typescript
describe('Command-Specific Codex Prompts', () => {
  test.each([
    ['sc:implement', 'implementation strategy'],
    ['sc:load', 'session restoration'],
    ['sc:save', 'session persistence']
  ])('should use appropriate prompt for %s command', async (command, expectedContext) => {
    // Arrange
    const mockCodex = jest.fn().mockResolvedValue({ guidance: 'test' });
    const ctx = createMockScContext(command, 'user request');

    // Act
    await executeScCommand(ctx);

    // Assert
    const prompt = mockCodex.mock.calls[0][0].prompt;
    expect(prompt).toContain(expectedContext);
    expect(prompt).toContain(command);
  });
});
```

#### 3. Error Handling Validation
```typescript
describe('Codex Integration Error Handling', () => {
  test('should handle Codex failure gracefully for non-critical commands', async () => {
    // Arrange
    const mockCodex = jest.fn().mockRejectedValue(new Error('Codex unavailable'));
    const ctx = createMockScContext('sc:load', 'test prompt');

    // Act & Assert
    await expect(executeScCommand(ctx)).not.toThrow();
    expect(ctx.metadata.codexCall.error).toBe('Codex call failed');
    expect(ctx.metadata.codexCall.fallback).toBe(true);
  });

  test('should fail for critical commands when Codex is unavailable', async () => {
    // Arrange
    const mockCodex = jest.fn().mockRejectedValue(new Error('Codex unavailable'));
    const ctx = createMockScContext('sc:implement', 'critical implementation');

    // Act & Assert
    await expect(executeScCommand(ctx)).rejects.toThrow('Critical Codex integration failure');
  });
});
```

### Integration Testing Requirements

#### 1. End-to-End Command Flow Tests
```typescript
describe('E2E Command Flow with Codex', () => {
  test('should execute full /sc:implement flow with Codex integration', async () => {
    // Arrange
    const userPrompt = 'create React authentication component with TypeScript';

    // Act
    const result = await executeScImplement(userPrompt);

    // Assert
    expect(result.codexGuidance).toBeDefined();
    expect(result.codexGuidance).toContain('React');
    expect(result.codexGuidance).toContain('authentication');
    expect(result.implementationPlan).toBeDefined();
    expect(result.success).toBe(true);
  });

  test('should execute /sc:load with project context analysis', async () => {
    // Arrange
    const userPrompt = 'load project context for COCOSiL diagnosis system';

    // Act
    const result = await executeScLoad(userPrompt);

    // Assert
    expect(result.codexGuidance).toBeDefined();
    expect(result.projectContext).toBeDefined();
    expect(result.sessionReady).toBe(true);
  });

  test('should execute /sc:save with optimization strategy', async () => {
    // Arrange
    const userPrompt = 'save session with comprehensive checkpoint';

    // Act
    const result = await executeScSave(userPrompt);

    // Assert
    expect(result.codexGuidance).toBeDefined();
    expect(result.persistenceStrategy).toBeDefined();
    expect(result.checkpointCreated).toBe(true);
  });
});
```

#### 2. Performance Testing
```typescript
describe('Codex Integration Performance', () => {
  test('should complete Codex call within performance bounds', async () => {
    // Arrange
    const ctx = createMockScContext('sc:implement', 'performance test');
    const startTime = Date.now();

    // Act
    await ensureCodexUsage(ctx);

    // Assert
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 second timeout
    expect(ctx.metadata.codexCall).toBeDefined();
  });

  test('should not significantly impact overall command performance', async () => {
    // Arrange
    const userPrompt = 'quick implementation test';
    const startTime = Date.now();

    // Act
    await executeScImplement(userPrompt);

    // Assert
    const totalDuration = Date.now() - startTime;
    expect(totalDuration).toBeLessThan(10000); // 10 second total limit
  });
});
```

### Mock Implementations

#### Codex Mock Helper
```typescript
export function createMockCodexResponse(overrides = {}) {
  return {
    guidance: 'Default implementation guidance',
    strategy: 'Recommended implementation strategy',
    optimizations: ['Use TypeScript for type safety', 'Implement error handling'],
    risks: ['Consider performance implications', 'Validate input parameters'],
    ...overrides
  };
}

export function createMockScContext(commandName: string, userPrompt: string) {
  return {
    commandName,
    userInput: {
      raw: userPrompt,
      args: userPrompt.split(' ')
    },
    metadata: {},
    summary: `Test execution of ${commandName}`
  };
}
```

#### Test Utilities
```typescript
export async function executeScCommand(ctx: ScCommandContext) {
  // Simulate the standard /sc: command flow
  const codexResult = await ensureCodexUsage(ctx);

  // Simulate command-specific logic
  switch (ctx.commandName) {
    case 'sc:implement':
      return executeImplementationLogic(ctx, codexResult);
    case 'sc:load':
      return executeLoadLogic(ctx, codexResult);
    case 'sc:save':
      return executeSaveLogic(ctx, codexResult);
    default:
      throw new Error(`Unknown command: ${ctx.commandName}`);
  }
}
```

## Validation Checklist

### Pre-Implementation Validation
- [ ] Command metadata includes `codex.required: true`
- [ ] Command MCP servers list includes `codex`
- [ ] Behavioral flow starts with "Codex Consultation"
- [ ] Command examples show Codex integration

### Post-Implementation Validation
- [ ] Unit tests pass for Codex integration requirement
- [ ] Integration tests verify end-to-end flow
- [ ] Performance tests meet timing requirements
- [ ] Error handling tests validate fallback behavior

### Command-Specific Validation
- [ ] `/sc:implement` - Codex provides implementation strategy
- [ ] `/sc:load` - Codex provides session restoration guidance
- [ ] `/sc:save` - Codex provides persistence optimization
- [ ] All commands cache Codex results within execution

## Automated Testing Integration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testMatch: [
    '**/tests/sc-commands/**/*.test.ts',
    '**/tests/codex-integration/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/codex-mocks.ts'],
  testTimeout: 10000 // Allow time for Codex calls
};
```

### Test Setup
```typescript
// tests/setup/codex-mocks.ts
import { jest } from '@jest/globals';

beforeEach(() => {
  // Mock the Codex tool
  jest.mock('mcp__codex__codex', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      guidance: 'Mock guidance',
      strategy: 'Mock strategy'
    })
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});
```

### Continuous Integration

#### GitHub Actions Workflow
```yaml
name: SC Command Codex Integration Tests

on: [push, pull_request]

jobs:
  test-codex-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run Codex integration tests
        run: npm run test:codex-integration
      - name: Validate command compliance
        run: npm run validate:sc-commands
```

#### Command Compliance Validator
```typescript
// scripts/validate-sc-commands.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function validateScCommandCompliance() {
  const commandsDir = '/Users/masaki/.claude/commands/sc';
  const commands = readdirSync(commandsDir).filter(f => f.endsWith('.md'));

  for (const commandFile of commands) {
    const content = readFileSync(join(commandsDir, commandFile), 'utf8');

    // Parse YAML frontmatter
    const frontmatter = parseFrontmatter(content);

    // Validate Codex requirement
    if (!frontmatter.codex?.required) {
      throw new Error(`Command ${commandFile} missing required Codex integration`);
    }

    if (!frontmatter['mcp-servers']?.includes('codex')) {
      throw new Error(`Command ${commandFile} missing codex in mcp-servers list`);
    }

    // Validate behavioral flow
    if (!content.includes('Codex Consultation')) {
      throw new Error(`Command ${commandFile} missing mandatory Codex consultation step`);
    }
  }

  console.log('✅ All /sc: commands comply with Codex integration requirement');
}

validateScCommandCompliance();
```

## Reporting and Metrics

### Test Coverage Requirements
- **Unit Tests**: 100% coverage for Codex integration functions
- **Integration Tests**: 90% coverage for command execution flows
- **Error Handling**: 100% coverage for fallback scenarios

### Success Metrics
- All `/sc:` commands successfully call Codex on first execution
- Zero production failures due to missing Codex integration
- Performance impact < 10% of total command execution time
- Error handling maintains command functionality even with Codex failures

## Troubleshooting Guide

### Common Issues
1. **Codex not called**: Check command metadata and behavioral flow
2. **Multiple Codex calls**: Verify caching mechanism implementation
3. **Performance degradation**: Review Codex call timing and caching
4. **Test failures**: Ensure proper mocking and error handling

### Debug Commands
```bash
# Run specific Codex integration tests
npm test -- --testPathPattern="codex-integration"

# Validate command compliance
npm run validate:sc-commands

# Check performance metrics
npm run test:performance -- --testNamePattern="Codex"
```