---
description: Deploy project with environment management
argument-hint: "[environment: dev|staging|prod]"
allowed-tools: Bash, Read, Grep, Task
---

## Context
- Git branch: !`git rev-parse --abbrev-ref HEAD`
- Git status: !`git status --porcelain`
- Build status: !`ls -la dist/ build/ || echo "No build artifacts found"`
- Environment: **$ARGUMENTS** (default: dev)

## Deployment Pipeline
Deploy to: **$ARGUMENTS**

### Your Task - Safe Deployment Process

#### 1. Pre-Deployment Validation
- **Build Verification**: Ensure build artifacts exist and are valid
- **Environment Check**: Validate target environment configuration
- **Health Check**: Verify current production state before deployment
- **Rollback Preparation**: Prepare rollback strategy and backup points

#### 2. Deployment Execution
- **Artifact Upload**: Deploy build artifacts to target environment
- **Configuration Update**: Apply environment-specific configurations
- **Service Management**: Handle service restarts and dependency updates
- **Database Migrations**: Apply any necessary database changes

#### 3. Post-Deployment Validation
- **Smoke Tests**: Run basic functionality tests in target environment
- **Health Monitoring**: Monitor system health and performance metrics
- **Log Analysis**: Check deployment logs for errors or warnings
- **User Acceptance**: Verify core user journeys work correctly

#### 4. Rollback Capability
- **Automated Rollback**: Prepare automated rollback if issues detected
- **Manual Rollback**: Document manual rollback procedures
- **State Recovery**: Plan for data and state recovery if needed
- **Communication**: Prepare incident communication if rollback needed

### Environment-Specific Deployment

#### Development (`dev`)
- Continuous deployment from development branch
- Development database and configurations
- Debug logging enabled
- Fast iteration and testing focus

#### Staging (`staging`)
- Production-like environment for final testing
- Production data mirrors (anonymized)
- Full integration testing
- User acceptance testing environment

#### Production (`prod`)
- Zero-downtime deployment strategies
- Full monitoring and alerting
- Production security and performance settings
- Comprehensive rollback capabilities

### Safety Checklist
- [ ] Build artifacts validated and tested
- [ ] Environment configurations verified
- [ ] Database backup completed (if applicable)  
- [ ] Rollback procedure tested and ready
- [ ] Monitoring and alerting configured
- [ ] Team notification sent
- [ ] Deployment window approved

Execute deployment with comprehensive safety measures and monitoring.