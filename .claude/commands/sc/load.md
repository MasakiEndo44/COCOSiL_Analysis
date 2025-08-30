---
description: Load project context and session state
argument-hint: "[session-id]"
allowed-tools: Read, Glob, Grep, Bash
---

## Context
- Current directory: !`pwd`
- Git status: !`git status --porcelain`
- Git branch: !`git rev-parse --abbrev-ref HEAD`
- Project files: !`find . -type f -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.py" | head -20`

## Session Loading
Load session state for: **$ARGUMENTS**

### Your Task
1. **Project Analysis**: Scan the current project structure and understand the codebase
2. **Context Recovery**: If a session ID is provided, restore previous session context
3. **Framework Activation**: Activate SuperClaude framework components and behavioral flags
4. **State Initialization**: Initialize todo management and task tracking systems
5. **Ready State**: Confirm the session is ready for development tasks

### SuperClaude Framework Activation
- Enable parallel thinking and tool optimization
- Activate MCP server integration (Context7, Sequential, Magic, Morphllm, Serena, Playwright)
- Initialize behavioral flags based on project complexity
- Set up evidence-based reasoning and quality checkpoints

### Session Restoration Protocol
If session ID provided:
- Locate session checkpoint files
- Restore previous context and todo states  
- Resume interrupted tasks and workflows
- Validate restored state integrity

Begin with comprehensive project discovery and framework initialization.