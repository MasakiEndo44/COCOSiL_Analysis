---
description: Save current session state and context
argument-hint: "[session-name]"
allowed-tools: Write, Bash, Read
---

## Context
- Current directory: !`pwd`
- Git status: !`git status --porcelain`
- Active branch: !`git rev-parse --abbrev-ref HEAD`
- Timestamp: !`date`

## Session Saving
Save session state as: **$ARGUMENTS**

### Your Task
1. **State Capture**: Serialize current session state including:
   - Active todos and task progress
   - Project context and recent changes
   - Framework configuration and active flags
   - Key findings and decisions made

2. **Session Persistence**: Create session checkpoint with:
   - Unique session identifier
   - Timestamp and git commit reference
   - Resumable state information
   - Context summary for quick restoration

3. **Cleanup Operations**: 
   - Archive temporary files and logs
   - Document session outcomes
   - Prepare workspace for next session

4. **Checkpoint Creation**: Generate session file in `.claude/sessions/` with:
   - Session metadata (timestamp, duration, tasks completed)
   - Project state snapshot
   - Recovery instructions
   - Key achievements and remaining tasks

### Session Archive Format
Create structured session archive including:
- Session manifest with restoration instructions
- Todo list snapshot and completion status
- Key decisions and architectural choices
- Outstanding issues and next steps
- Quality checkpoints and validation results

Complete session archival and confirm successful save operation.