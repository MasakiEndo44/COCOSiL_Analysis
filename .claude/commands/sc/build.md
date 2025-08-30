---
description: Build project with comprehensive validation
argument-hint: "[target: dev|prod|test|all]"  
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Context
- Project root: !`pwd`
- Git status: !`git status --short`
- Package file: @package.json
- Build scripts: !`npm run | grep -E "(build|dev|test|lint)" || echo "No npm scripts found"`

## Build Target
Build for: **$ARGUMENTS** (default: dev)

### Your Task - Comprehensive Build Process

#### 1. Pre-Build Validation
- **Dependency Check**: Verify all dependencies are installed and up-to-date
- **Git State**: Ensure working directory is clean or changes are committed
- **Configuration**: Validate build configuration and environment variables
- **Linting**: Run code quality checks and fix any issues

#### 2. Build Execution
- **Primary Build**: Execute main build process for target environment
- **Optimization**: Apply appropriate optimizations (minification, bundling, etc.)
- **Asset Processing**: Handle static assets, images, and external resources
- **Source Maps**: Generate source maps if needed for debugging

#### 3. Post-Build Validation
- **Build Verification**: Confirm build artifacts are generated correctly
- **Size Analysis**: Check bundle sizes and identify optimization opportunities
- **Functionality Testing**: Run smoke tests on built artifacts
- **Quality Gates**: Ensure all quality checks pass

#### 4. Error Handling & Recovery
- **Failure Analysis**: If build fails, provide detailed error analysis
- **Dependency Resolution**: Resolve missing dependencies or version conflicts
- **Configuration Fixes**: Correct configuration issues that prevent building
- **Incremental Recovery**: Attempt partial builds if full build fails

### Build Targets

#### Development Build (`dev`)
- Fast build optimized for development workflow
- Source maps enabled for debugging
- Hot reload and watch mode if available
- Development-specific configurations

#### Production Build (`prod`)
- Fully optimized build for production deployment
- Minification and compression applied
- Production environment configurations
- Performance optimizations enabled

#### Test Build (`test`)
- Build optimized for testing environments
- Test coverage instrumentation
- Mock configurations if needed
- Test-specific asset handling

#### All Targets (`all`)
- Sequential build of all target environments
- Cross-target validation and comparison
- Comprehensive artifact generation
- Full quality assurance pipeline

### Build Workflow
1. **Environment Setup**: Configure build environment and dependencies
2. **Pre-flight Checks**: Validate project state and dependencies
3. **Parallel Processing**: Use parallel builds where possible for efficiency
4. **Quality Validation**: Run linting, tests, and quality checks
5. **Artifact Generation**: Create build artifacts for target environment
6. **Verification**: Validate build success and artifact integrity
7. **Cleanup**: Remove temporary files and prepare clean state

### Success Criteria
- ✅ All build steps complete without errors
- ✅ Generated artifacts pass validation tests
- ✅ Quality gates are satisfied (lint, test coverage)
- ✅ Build size and performance metrics within acceptable ranges
- ✅ No security vulnerabilities in build artifacts

Begin build process with comprehensive validation and error handling.