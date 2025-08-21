# Signup OTP Fake Repository API

![CI](https://github.com/teguholica/signup_otp_fake_repository_api/workflows/CI%20Pipeline/badge.svg)
[![codecov](https://codecov.io/gh/teguholica/signup_otp_fake_repository_api/branch/master/graph/badge.svg)](https://codecov.io/gh/teguholica/signup_otp_fake_repository_api)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

A lightweight Node.js REST API that provides user registration with email verification using OTP (One-Time Password). This project uses in-memory storage (fake repositories) for simplicity, making it perfect for development, testing, and prototyping purposes.

## 🚀 Features

- **User Registration** with email validation
- **OTP-based Email Verification** (6-digit codes)
- **Secure Password Hashing** using bcrypt
- **Rate Limiting** for OTP attempts (max 5 attempts)
- **In-Memory Storage** - no database setup required
- **Comprehensive Test Suite** with Jest
- **CI/CD Ready** with GitHub Actions workflows
- **Production Ready** with proper error handling

## 📋 API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user account |
| POST | `/auth/otp/request` | Request new OTP for email verification |
| POST | `/auth/otp/verify` | Verify OTP code |
| GET | `/health` | Health check endpoint |

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/teguholica/signup_otp_fake_repository_api
   cd signup_otp_fake_repository_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **The API will be available at** `http://localhost:3000`

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:ci
```

## 📖 API Documentation

### User Registration (`POST /auth/signup`)

Register a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "SIGNUP_OK",
  "email": "user@example.com",
  "status": "PENDING_VERIFICATION",
  "otp": "123456"  // Only in development mode
}
```

**Validation Rules:**
- Email must be valid format
- Password minimum 6 characters
- Email must be unique

### Request OTP (`POST /auth/otp/request`)

Request a new OTP for email verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP_SENT",
  "email": "user@example.com",
  "otp": "654321"  // Only in development mode
}
```

### Verify OTP (`POST /auth/otp/verify`)

Verify the OTP code sent to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "VERIFIED",
  "email": "user@example.com",
  "verifiedAt": 1695123456789
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |

### Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
- **OTP Security**: 
  - 6-digit numeric codes
  - 5-minute expiration time
  - Maximum 5 verification attempts per OTP
  - OTP is deleted after successful verification or expiration
- **Input Validation**: Email format and password length validation
- **Error Handling**: Comprehensive error responses without exposing sensitive information

## 🏗️ Project Structure

```
signup_otp_fake_repository_api/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js             # Server entry point
│   ├── controllers/
│   │   └── auth.controller.js # Request handlers
│   ├── services/
│   │   └── auth.service.js   # Business logic
│   ├── repositories/
│   │   ├── user.repository.js # User data storage
│   │   └── otp.repository.js # OTP data storage
│   ├── middlewares/
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   └── auth.routes.js    # Route definitions
│   └── utils/
│       └── otp.js            # OTP generation utility
├── tests/
│   ├── auth.test.js          # API endpoint tests
│   ├── services/
│   │   └── auth.service.test.js
│   └── repositories/
│       ├── user.repository.test.js
│       └── otp.repository.test.js
├── .github/workflows/        # CI/CD pipelines
├── package.json
└── README.md
```

## 🔄 Data Storage

This project uses **in-memory storage** with fake repositories:

- **User Repository**: Stores user data in a Map object
- **OTP Repository**: Stores OTP codes with expiration times
- **Data Persistence**: All data is lost when the server restarts
- **Thread Safety**: Single-threaded Node.js execution ensures data consistency

**Note**: This storage approach is designed for development/testing. For production use, consider integrating with a proper database.

## 🚦 Error Handling

The API provides consistent error responses:

```json
{
  "error": "ERROR_CODE",
  "detail": "Additional information"
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_EMAIL` | 400 | Invalid email format |
| `INVALID_PASSWORD` | 400 | Password too short |
| `USER_ALREADY_EXISTS` | 409 | Email already registered |
| `USER_NOT_FOUND` | 404 | Email not found |
| `OTP_NOT_FOUND` | 404 | No active OTP for email |
| `OTP_EXPIRED` | 400 | OTP has expired |
| `OTP_TOO_MANY_ATTEMPTS` | 400 | Maximum attempts exceeded |
| `OTP_INVALID` | 400 | Incorrect OTP code |

## 🚀 Deployment

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Behavior

- **Development Mode**: Returns OTP codes in responses for easier testing
- **Production Mode**: OTP codes are not exposed in API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 🔍 Monitoring & Logging

The API includes:
- Health check endpoint at `/health`
- Comprehensive error logging
- Test coverage reporting

## 📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

For questions or issues, please open an issue on the GitHub repository or contact the development team.
