# Budget Dashboard - Docker Setup

This document provides instructions for running the Budget Dashboard application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd budget-main
   ```

2. **Build and run the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Architecture

The application consists of two main services:

### Backend (`budget-backend`)
- **Technology**: FastAPI + SQLAlchemy
- **Port**: 8000
- **Database**: SQLite (persistent volume)
- **Health Check**: `GET /health`

### Frontend (`budget-frontend`)
- **Technology**: React + Nginx
- **Port**: 3000 (mapped to 80 internally)
- **Health Check**: `GET /health`

## Available Commands

### Development

```bash
# Start services in development mode
docker-compose up

# Start services in background
docker-compose up -d

# Build and start services
docker-compose up --build

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

### Production

```bash
# Build and start in production mode
docker-compose -f docker-compose.yml up --build -d

# Scale services (if needed)
docker-compose up --scale backend=2 --scale frontend=2
```

### Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete the database)
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Environment Variables

### Backend
- `DATABASE_DIR`: Directory for SQLite database (default: `./data`)
- `PYTHONPATH`: Python path (set to `/app`)

### Frontend
No specific environment variables required.

## Data Persistence

The SQLite database is stored in a Docker volume (`backend_data`) to ensure data persists between container restarts.

## Health Checks

Both services include health checks:
- **Backend**: Checks FastAPI health endpoint
- **Frontend**: Checks Nginx serving status

## Networking

Services communicate through a custom Docker network (`budget-network`) for improved security and isolation.

## Security Features

### Backend
- Latest dependency versions to fix security vulnerabilities
- Health checks for monitoring
- Proper Python environment isolation

### Frontend
- Multi-stage build for smaller production image
- Nginx security headers
- Gzip compression
- Proper caching strategies

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "3001:80"  # Frontend
     - "8001:8000"  # Backend
   ```

2. **Permission issues on Windows**:
   ```bash
   # Run Docker as administrator or enable WSL2
   ```

3. **Database issues**:
   ```bash
   # Reset database volume
   docker-compose down -v
   docker-compose up --build
   ```

4. **Build issues**:
   ```bash
   # Clean build with no cache
   docker-compose build --no-cache
   ```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Accessing Containers

```bash
# Backend container
docker-compose exec backend bash

# Frontend container (if needed)
docker-compose exec frontend sh
```

## Development vs Production

The current setup is optimized for development with hot reloading enabled. For production:

1. Remove volume mounts in `docker-compose.yml`
2. Set `--reload` to `false` in backend Dockerfile
3. Use environment-specific configuration files
4. Consider using external databases (PostgreSQL/MySQL)

## Monitoring

Health check endpoints:
- Backend: `http://localhost:8000/health`
- Frontend: `http://localhost:3000/health`

## Backup and Restore

### Backup Database
```bash
# Copy database from volume
docker cp budget-backend:/app/data/financial_dashboard.db ./backup_$(date +%Y%m%d_%H%M%S).db
```

### Restore Database
```bash
# Copy database to volume
docker cp ./backup.db budget-backend:/app/data/financial_dashboard.db
docker-compose restart backend
``` 