---
description: Test SuperClaude command system functionality
argument-hint: "[command-name]"
allowed-tools: Bash, Read, LS
---

## Context
- Commands directory: !`ls -la .claude/commands/sc/`
- Current directory: !`pwd`
- Test target: **$ARGUMENTS** (default: all)

## SuperClaude Command Test
Testing command: **$ARGUMENTS**

### Your Task - Command System Validation

#### 1. Command Discovery Test
List all available SuperClaude commands and verify they are properly structured:

- `/sc:load` - Session loading and context restoration
- `/sc:save` - Session state persistence  
- `/sc:checkpoint` - Quick checkpoint creation
- `/sc:analyze` - Comprehensive project analysis
- `/sc:review` - Code quality and security review
- `/sc:build` - Build process with validation
- `/sc:deploy` - Deployment pipeline management  
- `/sc:debug` - Systematic debugging process

#### 2. Command Structure Validation
Verify each command file contains:
- ✅ YAML front-matter with description and tools
- ✅ Context section with dynamic information
- ✅ Clear task definition with argument handling
- ✅ Structured workflow with actionable steps
- ✅ Integration with SuperClaude framework components

#### 3. Framework Integration Test
Confirm SuperClaude framework components are properly integrated:
- ✅ MCP server tool specifications (Gemini, o3, etc.)
- ✅ Behavioral flag activation instructions
- ✅ Parallel processing and optimization directives
- ✅ Quality gates and validation checkpoints
- ✅ Expert consultation protocols

#### 4. Functionality Test
Test core command functionality:
- Command argument parsing and default handling
- Dynamic context injection (git status, file info, etc.)
- Tool permission and access verification
- Integration with external expert systems (Gemini/o3)
- Error handling and recovery procedures

### Test Results Summary
Provide comprehensive test results including:
- ✅/❌ Command availability status
- ✅/❌ Structural integrity verification
- ✅/❌ Framework integration completeness
- ✅/❌ Functionality validation results
- 📝 Any issues identified and resolution steps
- 🚀 System readiness assessment

### Next Steps
Based on test results:
1. Fix any structural or integration issues
2. Add missing components or functionality
3. Optimize performance and user experience
4. Document usage patterns and best practices

The SuperClaude command system is now ready for development workflow integration!