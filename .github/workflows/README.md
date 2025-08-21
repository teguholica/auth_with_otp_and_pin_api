# GitHub Actions CI/CD Pipeline

This repository contains a comprehensive CI/CD pipeline using GitHub Actions for the Node.js signup OTP API.

## Workflows Overview

### 1. CI Pipeline (`.github/workflows/ci.yml`)
**Triggers**: Push/PR to `main` and `develop` branches

**Jobs**:
- **test**: Runs tests on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs linter (if configured)
  - Runs tests with coverage
  - Uploads coverage to Codecov
- **security**: Security checks
  - npm audit
  - Snyk vulnerability scanning
- **build**: Build verification
  - Creates build artifacts
  - Uploads artifacts for deployment

### 2. CD Pipeline (`.github/workflows/cd.yml`)
**Triggers**: Push to `main` branch or manual dispatch

**Jobs**:
- **deploy-staging**: Deploys to staging environment
- **deploy-production**: Deploys to production (after staging success)
- **notify**: Sends deployment notifications

### 3. Security Scan (`.github/workflows/security.yml`)
**Triggers**: 
- Weekly schedule (Mondays 2 AM)
- Push/PR to `main` and `develop`
- Manual dispatch

**Jobs**:
- **dependency-scan**: Scans for vulnerable dependencies
- **code-scan**: CodeQL analysis for security issues
- **secrets-scan**: Scans for leaked secrets/tokens

## Setup Instructions

### Required Secrets
Add these secrets to your GitHub repository settings:

1. **SNYK_TOKEN** (optional): For Snyk vulnerability scanning
   - Get it from [Snyk.io](https://snyk.io)

2. **Deployment secrets** (configure based on your deployment target):
   - **HEROKU_API_KEY**: For Heroku deployment
   - **AWS_ACCESS_KEY_ID**: For AWS deployment
   - **AWS_SECRET_ACCESS_KEY**: For AWS deployment

### Environment Configuration
Configure these environments in your repository settings:

1. **staging**: Staging deployment environment
2. **production**: Production deployment environment

## Available Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run test         # Run tests with coverage
npm run test:watch   # Run tests in watch mode
npm run test:ci      # Run tests in CI mode

# Security
npm run security:audit    # Check for vulnerabilities
npm run security:fix      # Fix vulnerabilities automatically

# Quality
npm run lint         # Run linter (placeholder)
npm run lint:fix     # Fix linting issues (placeholder)
```

## Customization

### Adding a Linter
To add ESLint support:
```bash
npm install --save-dev eslint @eslint/js
npx eslint --init
```

Then update the `lint` and `lint:fix` scripts in package.json.

### Deployment Configuration
The CD pipeline includes placeholder deployment commands. Update these based on your deployment target:

- **Heroku**: Uncomment and configure Heroku deployment commands
- **AWS**: Configure AWS CLI commands
- **Docker**: Add Docker build and push steps
- **Other**: Replace with your deployment commands

### Coverage Reports
The pipeline uploads coverage reports to Codecov. To view reports:
1. Sign up at [Codecov.io](https://codecov.io)
2. Add your repository
3. Add `CODECOV_TOKEN` to your GitHub secrets (optional for public repos)

## Monitoring

### GitHub Actions Tab
Monitor all workflows at: `https://github.com/[username]/[repo]/actions`

### Security Alerts
- **Dependabot**: Automatic security updates
- **Code scanning**: Security alerts from CodeQL
- **Secret scanning**: Alerts for leaked secrets

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check Node.js version compatibility
   - Ensure all dependencies are properly installed
   - Verify environment variables

2. **Security scan failures**
   - Review npm audit output
   - Update vulnerable dependencies
   - Check for false positives in Snyk

3. **Deployment failures**
   - Verify deployment secrets are set
   - Check environment configuration
   - Review deployment logs

## Best Practices

1. **Branch Protection**
   - Require PR reviews
   - Require status checks to pass
   - Require up-to-date branches

2. **Security**
   - Regularly update dependencies
   - Use security scanning tools
   - Rotate secrets regularly

3. **Performance**
   - Cache dependencies in workflows
   - Use matrix builds for compatibility
   - Optimize test execution time
