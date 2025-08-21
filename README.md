# Authentication API with OTP and PIN

A Node.js authentication API that provides user signup, OTP verification, and PIN-based authentication using PostgreSQL.

## Features

- User registration with email verification via OTP
- OTP (One-Time Password) generation and verification
- PIN-based authentication
- PostgreSQL database with proper schema
- Docker support for easy development
- Comprehensive test suite

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn

## Quick Start

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following configuration:
- Database: `auth_api_test`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration should work with the Docker setup.

### 4. Initialize Database

The database will be automatically initialized when you run the tests or start the application.

### 5. Run Tests

```bash
npm test
```

### 6. Start the Application

```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/otp/request` - Request a new OTP
- `POST /auth/otp/verify` - Verify OTP
- `POST /auth/login` - Login with PIN

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
npm run test:coverage
```

### Database Reset

To reset the database (drops and recreates all tables):

```bash
npm run db:reset
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

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs postgres

# Reset PostgreSQL data
docker-compose down -v
docker-compose up -d
```

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
│   └── app.js
├── tests/
│   ├── auth.test.js
│   ├── setup.js
│   └── services/
│       └── auth.service.test.js
├── docker-compose.yml
├── jest.config.js
└── package.json
