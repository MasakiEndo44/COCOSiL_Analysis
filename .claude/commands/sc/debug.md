---
description: Systematic debugging and problem resolution
argument-hint: "[issue-type: error|performance|bug|crash]"
allowed-tools: Bash, Read, Grep, Task, mcp__gemini-cli__googleSearch, mcp__o3-low__o3-search
---

## Context
- Current error logs: !`tail -20 *.log 2>/dev/null || echo "No log files found"`
- Git status: !`git status --porcelain`
- Recent changes: !`git log --oneline -3`
- System info: !`uname -a`

## Debug Target
Debug issue type: **$ARGUMENTS** (default: error)

### Your Task - Systematic Debugging Process

#### 1. Problem Definition & Reproduction
- **Issue Characterization**: Define exact problem symptoms and scope
- **Reproduction Steps**: Document reliable reproduction pathway
- **Environment Analysis**: Identify environmental factors and dependencies
- **Timeline Analysis**: Map when issue first appeared and triggering changes

#### 2. Data Collection & Analysis
- **Log Analysis**: Comprehensive review of application and system logs
- **Stack Trace Analysis**: Detailed examination of error stack traces
- **Performance Profiling**: System and application performance metrics
- **Network Analysis**: Request/response patterns and network timing

#### 3. Hypothesis Generation
- **Root Cause Theories**: Generate 5-7 potential root causes
- **Probability Assessment**: Rank theories by likelihood and impact
- **Testing Strategy**: Design tests to validate/eliminate hypotheses
- **Quick Wins**: Identify immediate fixes that could resolve issue

#### 4. Expert Consultation & Research
- **Gemini Research**: Query for similar issues and solutions online
- **o3 Analysis**: Deep reasoning about complex system interactions
- **Documentation Review**: Check official docs and known issues
- **Community Knowledge**: Search for community solutions and workarounds

#### 5. Systematic Resolution
- **Hypothesis Testing**: Test each theory methodically with evidence
- **Fix Implementation**: Apply validated solutions incrementally
- **Regression Testing**: Ensure fix doesn't break existing functionality
- **Monitoring Setup**: Implement monitoring to prevent recurrence

### Debug Methodologies by Issue Type

#### Error Debugging
- Exception analysis and stack trace investigation
- Input validation and boundary condition testing
- API response and error code analysis
- Configuration and environment variable review

#### Performance Debugging  
- Resource usage profiling (CPU, memory, disk, network)
- Query optimization and database performance
- Caching strategy analysis and optimization
- Bottleneck identification and elimination

#### Logic Bug Debugging
- Step-through debugging and breakpoint analysis
- Data flow tracing and state examination  
- Unit test development for problematic scenarios
- Code path analysis and edge case identification

#### System Crash Debugging
- Core dump analysis and memory investigation
- System resource exhaustion analysis
- Deadlock and race condition detection
- Hardware and infrastructure health checks

### Resolution Framework
1. **Evidence Gathering**: Collect comprehensive diagnostic data
2. **Pattern Recognition**: Identify recurring patterns and triggers
3. **Incremental Testing**: Test solutions in controlled stages  
4. **Validation Protocol**: Verify fix addresses root cause, not symptoms
5. **Prevention Strategy**: Implement monitoring and prevention measures
6. **Documentation**: Record solution for future reference

### Expert Integration Process
- Present collected evidence to external experts (Gemini/o3)
- Cross-reference findings with online knowledge bases
- Validate solution approaches against industry best practices
- Synthesize multiple expert opinions into coherent action plan

Begin systematic debugging with evidence-based hypothesis testing and expert consultation.