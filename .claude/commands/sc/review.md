---
description: Comprehensive code review and quality assessment
argument-hint: "[target: files|changes|recent|all]"
allowed-tools: Read, Grep, Bash, Task, mcp__gemini-cli__googleSearch, mcp__o3-low__o3-search
---

## Context
- Git status: !`git status --porcelain`
- Recent commits: !`git log --oneline -5`
- Modified files: !`git diff --name-only HEAD~1`
- Branch: !`git rev-parse --abbrev-ref HEAD`

## Review Scope  
Review target: **$ARGUMENTS** (default: changes)

### Your Task - Multi-Level Code Review

#### 1. Code Quality Review
- **Style Consistency**: Check adherence to project coding standards
- **Naming Conventions**: Evaluate variable, function, and class naming
- **Code Organization**: Assess file structure and module organization
- **DRY Principle**: Identify code duplication and refactoring opportunities

#### 2. Functional Review
- **Logic Correctness**: Verify algorithm implementation and business logic
- **Error Handling**: Check exception handling and edge case coverage
- **Input Validation**: Review data validation and sanitization
- **API Design**: Assess interface design and usability

#### 3. Security Assessment
- **Vulnerability Scanning**: Check for common security anti-patterns
- **Data Protection**: Review sensitive data handling and storage
- **Authentication/Authorization**: Verify access control implementations
- **Input Security**: Check for injection vulnerabilities and XSS

#### 4. Performance Analysis
- **Efficiency Review**: Identify performance bottlenecks and inefficiencies
- **Resource Usage**: Check memory and CPU usage patterns
- **Scalability**: Assess code scalability and optimization opportunities
- **Database Queries**: Review query efficiency and N+1 problems

#### 5. Maintainability Assessment
- **Technical Debt**: Identify and quantify technical debt accumulation
- **Documentation**: Check code comments and inline documentation
- **Testability**: Assess how easily code can be unit tested
- **Dependency Management**: Review external dependencies and version management

### Review Process with Expert Consultation

#### Phase 1: Automated Analysis
- Use parallel tool calls for comprehensive code scanning
- Generate initial quality metrics and issue identification
- Create baseline assessment using available tools

#### Phase 2: Expert Consultation  
- **Gemini Analysis**: Consult Gemini for deep code understanding and web-sourced best practices
- **o3 Reasoning**: Use o3 for complex logic verification and architectural assessment
- Cross-validate findings between different AI perspectives

#### Phase 3: Synthesis and Prioritization
- Compile findings from all sources into coherent review
- Prioritize issues by severity and impact
- Generate actionable improvement recommendations

### Review Deliverables
- **Quality Report**: Comprehensive quality scorecard with metrics
- **Issue Catalog**: Categorized list of identified issues with severity ratings
- **Security Assessment**: Focused security review with risk ratings
- **Action Plan**: Prioritized roadmap for addressing identified issues
- **Best Practice Recommendations**: Industry standard alignment suggestions

### Expert Integration Protocol
1. Gather comprehensive code samples for external review
2. Consult Gemini for code pattern analysis and industry best practices
3. Use o3 for complex architectural reasoning and logic verification
4. Synthesize expert opinions with direct code analysis
5. Generate consensus recommendations with confidence ratings

Begin comprehensive review with parallel analysis and expert consultation.