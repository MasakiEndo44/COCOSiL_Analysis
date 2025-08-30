---
description: Comprehensive project analysis and architecture review
argument-hint: "[scope: file|module|project|system]"
allowed-tools: Read, Glob, Grep, Task, Bash
---

## Context
- Project root: !`pwd`
- Git status: !`git status --short`
- File count: !`find . -type f \( -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.json" \) | wc -l`
- Main branch: !`git rev-parse --abbrev-ref HEAD`

## Analysis Scope
Analyze scope: **$ARGUMENTS** (default: project)

### Your Task - Multi-Dimensional Analysis

#### 1. Architecture Discovery
- **Structure Analysis**: Map directory organization and file relationships
- **Dependency Mapping**: Identify internal and external dependencies  
- **Pattern Recognition**: Document architectural patterns and conventions used
- **Technology Stack**: Catalog frameworks, libraries, and tools in use

#### 2. Quality Assessment  
- **Code Quality**: Review maintainability, readability, and technical debt
- **Security Posture**: Identify potential vulnerabilities and security gaps
- **Performance Characteristics**: Analyze bottlenecks and optimization opportunities
- **Testing Coverage**: Evaluate test strategy and coverage gaps

#### 3. Development Workflow Analysis
- **Build Process**: Document build pipeline and deployment procedures
- **Git History**: Analyze commit patterns and development velocity
- **Documentation State**: Assess documentation quality and completeness
- **Configuration Management**: Review environment and deployment configs

#### 4. Strategic Insights
- **Scalability Assessment**: Evaluate growth and scaling constraints
- **Maintainability Score**: Rate long-term maintenance complexity
- **Technical Risk Factors**: Identify high-risk areas requiring attention
- **Improvement Recommendations**: Prioritized action items for enhancement

### Analysis Methodology
1. **Discovery Phase**: Use parallel tool calls for efficient codebase scanning
2. **Pattern Analysis**: Identify recurring structures and design decisions
3. **Quality Metrics**: Gather quantitative measures where possible
4. **Synthesis**: Combine findings into actionable insights and recommendations

### Deliverables
- Comprehensive architecture diagram and documentation
- Quality scorecard with specific metrics
- Risk assessment with mitigation strategies  
- Prioritized roadmap for improvements

Begin with parallel discovery and systematic analysis. Enable --think-hard mode for deep architectural understanding.