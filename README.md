# Authentication API with OTP and PIN

![CI](https://github.com/teguholica/auth_with_otp_and_pin_api/workflows/CI%20Pipeline/badge.svg)
[![codecov](https://codecov.io/gh/teguholica/auth_with_otp_and_pin_api/branch/master/graph/badge.svg)](https://codecov.io/gh/teguholica/auth_with_otp_and_pin_api)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

A Node.js authentication API that provides user signup, OTP verification, and PIN-based authentication using PostgreSQL.

## Features

- User registration with email verification via OTP
- OTP (One-Time Password) generation and verification
- PIN-based authentication
- PostgreSQL database with proper schema
- Comprehensive test suite
- **GitHub Actions CI/CD pipeline** with automated testing, security scanning, and deployment

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials.

### 3. Initialize Database

Create a PostgreSQL database and run the initialization:

```bash
npm run db:init
```

### 4. Run Tests

You can run tests using either of these scripts:

**Option 1: Using Docker with PostgreSQL (recommended)**
```bash
./scripts/run-tests-with-docker.sh
```

**Option 2: Using Docker without sudo**
```bash
./scripts/run-tests-with-docker-no-sudo.sh
```

These scripts will:
- Start a PostgreSQL container specifically for testing
- Wait for the database to be ready
- Initialize the test database
- Run all tests
- Clean up the container automatically

**Alternative: Manual testing (requires local PostgreSQL)**
```bash
npm test
```

### 5. Start the Application

```bash
npm start
```

The API will be available at `http://localhost:3000`

## GitHub Actions CI/CD

This project includes comprehensive GitHub Actions workflows:

### 🔄 **CI Pipeline** (`.github/workflows/ci.yml`)
- **Multi-version testing** on Node.js 18.x and 20.x
- **PostgreSQL service** for integration testing
- **Security scanning** with npm audit and Snyk
- **Code coverage** reporting with Codecov

### 🚀 **CD Pipeline** (`.github/workflows/cd.yml`)
- **Automated deployment** to staging and production
- **Staging deployment** on master branch
- **Production deployment** with manual approval

### 🔒 **Security Scanning** (`.github/workflows/security.yml`)
- **Weekly security audits** with npm audit
- **Snyk vulnerability scanning**
- **CodeQL analysis** for code security
- **SARIF report** generation for GitHub Security tab

### 🗄️ **Database Migrations** (`.github/workflows/migrations.yml`)
- **Automated migration testing** when schema changes
- **Database verification** with connectivity checks
- **Migration rollback testing**

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/otp/request` - Request a new OTP
- `POST /auth/otp/verify` - Verify OTP
- `POST /auth/login` - Login with PIN

### Health Check

- `GET /health` - Application health check with database connectivity status

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `pin_hash` (VARCHAR, Nullable)
- `status` (ENUM: 'PENDING_VERIFICATION', 'ACTIVE')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### OTPs Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `code` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `used` (BOOLEAN)
- `created_at` (TIMESTAMP)

## Development

### Running Tests with Coverage

```bash
npm test
```

### Database Reset

To reset the database (drops and recreates all tables):

```bash
npm run db:reset
npm run db:init
```

### Manual Database Setup

If you prefer to use a local PostgreSQL installation:

1. Install PostgreSQL
2. Create a database: `createdb auth_api_test`
3. Update `.env` file with your database credentials
4. Run: `npm run db:init`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `auth_api_test` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `OTP_LENGTH` | OTP code length | `6` |
| `OTP_EXPIRY_MINUTES` | OTP expiry time | `10` |

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository:

#### For Security Scanning
- `SNYK_TOKEN` - Snyk API token for vulnerability scanning

#### For Deployment (CD Pipeline)
- `AZUREAPPSERVICE_PUBLISHPROFILE_STAGING` - Azure App Service publish profile for staging
- `AZUREAPPSERVICE_PUBLISHPROFILE_PRODUCTION` - Azure App Service publish profile for production
- Or configure for your specific cloud provider

### Workflow Triggers

- **Push to master/develop**: Triggers CI pipeline
- **Pull requests**: Triggers CI pipeline
- **Database migrations**: Triggers migration testing
- **Weekly schedule**: Security scanning runs every Monday
- **Manual trigger**: All workflows support manual execution

## Project Structure

```
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_create_users_table.sql
│   │   │   └── 002_create_otps_table.sql
│   │   ├── init.js
│   │   └── reset.js
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── repositories/
│   │   ├── user.repository.js
│   │   └── otp.repository.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   └── auth.service.js
│   ├── utils/
│   │   └── otp.js
│   ├── app.js
│   └── server.js
├── tests/
│   ├── auth.test.js
│   ├── setup.js
│   ├── repositories/
│   │   └── user.repository.test.js
│   └── services/
│       └── auth.service.test.js
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       ├── security.yml
│       └── migrations.yml
├── jest.config.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request - the CI pipeline will automatically run tests and security checks

## License

ISC
