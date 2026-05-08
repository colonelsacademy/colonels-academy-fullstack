# Docker Usage Guide

## Overview

This project uses Docker for **local development** and **production deployment**.

## Local Development with Docker

### What Docker Does Locally

Docker runs PostgreSQL and Redis in containers so you don't need to install them on your machine.

```
Your Machine
    ↓
Docker Desktop
    ↓
┌─────────────────────────────────┐
│ PostgreSQL Container (port 5432)│
│ Redis Container (port 6379)     │
└─────────────────────────────────┘
    ↓
Your App connects to containers
```

### Getting Started

**1. Install Docker Desktop**
- [Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Mac](https://docs.docker.com/desktop/install/mac-install/)
- [Linux](https://docs.docker.com/desktop/install/linux-install/)

**2. Start Docker containers**
```bash
pnpm run db:up
```

This runs:
```bash
docker compose up -d
```

**3. Verify containers are running**
```bash
docker ps
```

You should see:
- `colonels-academy-postgres` (PostgreSQL)
- `colonels-academy-redis` (Redis)

**4. Setup database**
```bash
pnpm run dev:setup
```

This:
- Generates Prisma client
- Applies migrations
- Seeds initial data

**5. Start development**
```bash
pnpm run dev
```

This starts:
- Web app (Next.js) on http://localhost:3000
- API (Fastify) on http://localhost:4000
- Worker (BullMQ)

### Useful Commands

```bash
# Start containers
pnpm run db:up

# Stop containers (keeps data)
pnpm run db:down

# Stop containers and delete data
pnpm run db:down -- -v

# View container logs
docker logs colonels-academy-postgres
docker logs colonels-academy-redis

# Access PostgreSQL
docker exec -it colonels-academy-postgres psql -U postgres -d colonels_academy

# Access Redis
docker exec -it colonels-academy-redis redis-cli
```

## Production Deployment

### How Production Works

Production uses **Railway** with **Nixpacks** (not Docker):

```
Your Code
    ↓
GitHub (sushant_v2 branch)
    ↓
Railway detects Node.js
    ↓
Nixpacks builds container
    ↓
Container runs on Railway
    ↓
PostgreSQL (Railway managed)
Redis (Railway managed)
```

### Deployment Flow

1. **Push to `sushant_v2` branch**
   ```bash
   git push origin sushant_v2
   ```

2. **Merge to `dev` branch**
   ```bash
   # On GitHub, create PR and merge
   ```

3. **Railway automatically deploys**
   - Detects changes in `dev` branch
   - Builds container using Nixpacks
   - Runs `pnpm run start` command
   - Seed scripts run automatically

### Production Start Command

```bash
# From apps/api/package.json
pnpm --filter @colonels-academy/database run db:push && \
pnpm --filter @colonels-academy/database run db:seed:direct && \
pnpm --filter @colonels-academy/api run seed:asi-mock-tests && \
node dist/index.cjs
```

This:
1. Applies migrations
2. Seeds courses and lessons
3. Seeds ASI mock tests
4. Starts the API server

## Docker Compose File

The `docker-compose.yml` defines:

### PostgreSQL Service
- **Image**: postgres:16-alpine (lightweight)
- **Port**: 5432 (standard PostgreSQL port)
- **Database**: colonels_academy
- **Credentials**: postgres/postgres
- **Volume**: postgres_data (persists data)
- **Health check**: Verifies database is ready

### Redis Service
- **Image**: redis:7-alpine (lightweight)
- **Port**: 6379 (standard Redis port)
- **Volume**: redis_data (persists data)
- **Health check**: Verifies Redis is ready

### Volumes
- `postgres_data`: Stores PostgreSQL data
- `redis_data`: Stores Redis data

Data persists even if containers stop (unless you use `db:down -- -v`).

## Environment Variables

Local development uses `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/colonels_academy"
REDIS_URL="redis://localhost:6379"
```

Production uses Railway environment variables (set in Railway dashboard).

## Troubleshooting

### Containers won't start
```bash
# Check Docker is running
docker ps

# View error logs
docker logs colonels-academy-postgres
docker logs colonels-academy-redis

# Restart containers
pnpm run db:down
pnpm run db:up
```

### Port already in use
```bash
# Find what's using port 5432
lsof -i :5432

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
# Change "5432:5432" to "5433:5432"
```

### Database connection failed
```bash
# Verify containers are running
docker ps

# Check database is ready
docker exec colonels-academy-postgres pg_isready -U postgres

# Verify connection string in .env
cat .env | grep DATABASE_URL
```

### Reset everything
```bash
# Stop and delete all data
pnpm run db:down -- -v

# Start fresh
pnpm run dev:full
```

## Summary

| Aspect | Local | Production |
|--------|-------|------------|
| **Container Runtime** | Docker Desktop | Railway (Nixpacks) |
| **PostgreSQL** | Docker container | Railway managed |
| **Redis** | Docker container | Railway managed |
| **Build** | Manual (pnpm) | Automatic (Nixpacks) |
| **Deployment** | Manual (pnpm dev) | Automatic (git push) |
| **Data Persistence** | Docker volumes | Railway database |

Docker makes local development easy and consistent across all developers! 🐳
