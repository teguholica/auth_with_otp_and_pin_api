# Test Scripts with Docker PostgreSQL

This directory contains scripts to run tests with Docker PostgreSQL containers.

## Scripts

### 1. `run-tests-with-docker.sh`
Main script to run tests with Docker PostgreSQL. This script:
- Starts a PostgreSQL container
- Waits for the database to be ready
- Initializes the test database
- Runs the test suite
- Cleans up the container

**Usage:**
```bash
# Make sure you have npm in your PATH
./scripts/run-tests-with-docker.sh

# If you need to use sudo for Docker, ensure npm is available
sudo PATH=$PATH ./scripts/run-tests-with-docker.sh
```

### 2. `run-tests-with-docker-no-sudo.sh`
Alternative script that doesn't require sudo (if Docker is configured for user access):
- Same functionality as the main script
- Better error messages for Docker permission issues
- More user-friendly for systems where Docker is configured for non-root access

**Usage:**
```bash
./scripts/run-tests-with-docker-no-sudo.sh
```

## Prerequisites

1. **Docker** must be installed and running
2. **Node.js and npm** must be installed
3. **Docker permissions** (choose one):
   - Run Docker as root (use sudo)
   - Add your user to the docker group: `sudo usermod -aG docker $USER`

## Configuration

Both scripts use the following configuration:
- **Database**: `auth_test`
- **User**: `testuser`
- **Password**: `testpass`
- **Port**: `5433` (to avoid conflicts with local PostgreSQL)
- **PostgreSQL Version**: 15 Alpine

## Troubleshooting

### npm command not found
If you get "npm: command not found":
1. Ensure Node.js is installed: `node --version`
2. Check npm location: `which npm`
3. Use full path if needed: `sudo PATH=$PATH ./scripts/run-tests-with-docker.sh`

### Docker permission denied
If you get "permission denied" errors:
1. Start Docker service: `sudo systemctl start docker`
2. Add user to docker group: `sudo usermod -aG docker $USER`
3. Log out and back in for group changes to take effect

### Port already in use
If port 5433 is already in use, edit the script and change `POSTGRES_PORT` to a different port.

## Environment Variables

The scripts set these environment variables for the test run:
- `NODE_ENV=test`
- `DB_HOST=localhost`
- `DB_PORT=5433`
- `DB_NAME=auth_test`
- `DB_USER=testuser`
- `DB_PASSWORD=testpass`
