# CyberSec Log Ingestion Engine

A high-performance security log ingestion engine built with Bun, Elysia.js, React, Tailwind CSS, and Drizzle ORM (SQLite).

## Tech Stack
- **Runtime:** [Bun](https://bun.sh)
- **Backend:** [Elysia.js](https://elysiajs.com)
- **Frontend:** [React](https://react.dev) + [Vite](https://vitejs.dev)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Database:** SQLite (via Bun.sqlite)

## Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Database Setup
The database is automatically created as `sqlite.db` on the first push.
```bash
bun run db:push
```

### 3. Run the Project
Start both the Elysia backend and the Vite frontend:
```bash
bun run dev
```

- API: [http://localhost:3000](http://localhost:3000)
- Frontend: [http://localhost:5173](http://localhost:5173)

## Security Log Ingestion API

To ingest a security log, send a POST request to `/api/logs`:

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/api/v1/auth/login",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "shannonEntropy": 4.5,
    "requestSizeBytes": 1024,
    "correlationId": "trace-123",
    "severityLevel": "INFO"
  }'
```

## Project Structure
- `src/index.ts`: Elysia backend and API routes.
- `src/db/schema.ts`: Drizzle ORM schema for security logs.
- `src/App.tsx`: React frontend.
- `src/main.tsx`: React entry point.
- `drizzle.config.ts`: Drizzle Kit configuration.
- `vite.config.ts`: Vite configuration.