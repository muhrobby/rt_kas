# 07 - Deployment

## Overview

The app supports two deployment targets:
1. **Vercel** - Zero-config deployment with cloud PostgreSQL
2. **VPS (Self-hosted)** - Docker container with standalone Next.js output

---

## Environment Variables

All environments need these variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/kas_rt

# Better Auth
BETTER_AUTH_SECRET=minimum-32-char-random-string-here
BETTER_AUTH_URL=https://your-domain.com   # or http://localhost:3000 for dev

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Generating Secrets

```bash
# Generate a secure random secret
openssl rand -base64 32
```

---

## Option A: Vercel Deployment

### Database Provider Options

| Provider    | Free Tier          | Notes                            |
| ----------- | ------------------ | -------------------------------- |
| **Neon**    | 0.5GB storage      | Recommended. Serverless PG.      |
| **Supabase**| 500MB storage      | Also provides auth (not needed)  |
| **Railway** | $5/month credit    | Simple managed PG                |

### Steps

1. **Create database** on Neon/Supabase/Railway
2. **Push to GitHub** repository
3. **Import to Vercel:**
   - Connect GitHub repo
   - Set environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
   - Deploy
4. **Run migrations** (first deploy):
   ```bash
   # Locally, pointing to production DB
   DATABASE_URL=postgresql://... npx drizzle-kit migrate
   ```
5. **Seed data:**
   ```bash
   DATABASE_URL=postgresql://... npx tsx src/db/seed.ts
   ```

### Next.js Config for Vercel

No special config needed. Vercel handles Next.js natively.

```ts
// next.config.mjs (no changes needed for Vercel)
const nextConfig = {
  reactCompiler: true,
  // ... existing config
};
```

---

## Option B: VPS Deployment (Docker)

### next.config.mjs Changes

```ts
// next.config.mjs
const nextConfig = {
  output: "standalone",  // Required for Docker/VPS
  reactCompiler: true,
  // ... existing config
};
```

### Dockerfile

```dockerfile
# Dockerfile
FROM node:22-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build args for env vars needed at build time
ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG NEXT_PUBLIC_APP_URL

ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://kas_rt:password@db:5432/kas_rt
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    environment:
      - POSTGRES_USER=kas_rt
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=kas_rt
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kas_rt"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

### VPS Deployment Steps

1. **Set up VPS** (Ubuntu 22.04+ recommended)
2. **Install Docker + Docker Compose**
3. **Clone repository:**
   ```bash
   git clone <repo-url> /opt/kas-rt
   cd /opt/kas-rt
   ```
4. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```
5. **Build and start:**
   ```bash
   docker compose up -d --build
   ```
6. **Run migrations:**
   ```bash
   docker compose exec app npx drizzle-kit migrate
   ```
7. **Seed data:**
   ```bash
   docker compose exec app npx tsx src/db/seed.ts
   ```
8. **Set up reverse proxy** (Nginx/Caddy) for HTTPS

### Nginx Configuration (Optional)

```nginx
# /etc/nginx/sites-available/kas-rt
server {
    listen 80;
    server_name kas-rt.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable HTTPS with Certbot:
```bash
sudo certbot --nginx -d kas-rt.yourdomain.com
```

### Caddy Configuration (Simpler Alternative)

```
# Caddyfile
kas-rt.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Caddy handles HTTPS certificates automatically.

---

## Database Migrations in Production

### Strategy

1. **Development:** Use `db:push` for rapid iteration
2. **Production:** Use `db:generate` + `db:migrate` for versioned migrations

### Migration Workflow

```bash
# 1. After schema changes, generate SQL migration
npm run db:generate

# 2. Review generated SQL in ./drizzle/ directory

# 3. Apply to production
DATABASE_URL=postgresql://prod-url npm run db:migrate
```

### Rollback

Drizzle Kit generates forward-only migrations. For rollbacks:
- Write a manual down migration SQL
- Or restore from database backup

---

## Backup Strategy (VPS)

```bash
# Automated daily backup script
#!/bin/bash
BACKUP_DIR=/opt/backups/kas-rt
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

docker compose exec -T db pg_dump -U kas_rt kas_rt > "${BACKUP_DIR}/kas_rt_${TIMESTAMP}.sql"

# Keep only last 30 days
find ${BACKUP_DIR} -name "*.sql" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/kas-rt/backup.sh
```

---

## Monitoring (Optional)

For VPS deployments, consider:
- **Health check endpoint:** `GET /api/health` that returns DB connectivity status
- **Uptime monitoring:** UptimeRobot (free), Better Uptime
- **Log aggregation:** Docker logs with `docker compose logs -f app`
