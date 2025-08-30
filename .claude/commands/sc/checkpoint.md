---
description: Create quick checkpoint during active session
argument-hint: "[checkpoint-name]"
allowed-tools: Write, Bash, Read, TodoWrite
---

## Context
- Session time: !`date`
- Git status: !`git status --porcelain`
- Working directory: !`pwd`

## Quick Checkpoint
Create checkpoint: **$ARGUMENTS**

### Your Task
1. **Rapid State Capture**: Create lightweight checkpoint including:
   - Current todo list status and progress
   - Recent changes and active modifications
   - Key decisions made since last checkpoint
   - Any blockers or issues encountered

2. **Git Safety Point**: 
   - Ensure clean working directory or commit pending changes
   - Create recovery tag if needed
   - Document current branch state

3. **Progress Summary**: Provide concise update on:
   - Tasks completed since last checkpoint
   - Current focus and next immediate steps
   - Any risks or concerns identified
   - Time-sensitive items requiring attention

4. **Checkpoint Metadata**:
   - Timestamp and duration since last checkpoint
   - Quality indicators (tests passing, lint clean)
   - Resource usage and performance notes
   - Validation status of recent changes

### Quick Recovery Preparation
Ensure this checkpoint enables:
- Rapid session resumption
- Context restoration within 30 seconds
- Clear understanding of current state
- Next action priorities clearly defined

This is a lightweight checkpoint for active session continuity, not full session archival.