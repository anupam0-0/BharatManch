# BharatManch

A full-stack YouTube-like video platform built with a focus on clean architecture, scalability, and real-world development practices.

---

## Project Architecture

The project is structured as a monorepo-style setup containing both the frontend client and the backend API.

- **`client/`**: The frontend web application.
- **`server/`**: The backend API.

---

## Tech Stack

### Frontend (Client)
* **Framework:** Next.js 16
* **Library:** React 19
* **Styling:** TailwindCSS v4
* **Language:** TypeScript

### Backend (Server)
* **Runtime:** Bun
* **Framework:** Fastify
* **Language:** TypeScript
* **ORM:** Prisma 7
* **Database:** PostgreSQL
* **Validation:** Zod

### DevOps
* **Containerization:** Docker & Docker Compose

---

## Features (WIP)

* Authentication (JWT-based)
* User profiles & settings
* Video metadata management
* Video upload pipeline
* Background video processing (planned)
* Engagement: Likes, comments, subscriptions (planned)

---

## Getting Started

The easiest way to run the entire stack locally is by using Docker Compose.

### 1. Clone the repo

```bash
git clone https://github.com/anupam0-0/bharatmanch.git
cd bharatmanch
```

### 2. Setup Environment Variables

You might need to set up environment variables or rely on the defaults provided in the `docker-compose.yml`.

For backend (`server/.env`):
```env
DATABASE_URL=postgresql://bharatmanch:bharatmanch_secret@db:5432/bharatmanch?schema=public
```

For frontend (`client/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Start with Docker Compose

This will spin up the PostgreSQL database, the Fastify backend, and the Next.js frontend all at once, fully networked.

```bash
docker compose up --build -d
```

Once running:
- **Frontend App:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Database:** `localhost:5432`

---

## Local Development (Without Docker Compose)

If you prefer to run the services individually on your host machine for development:

### Start PostgreSQL Database
```bash
docker run -d \
  --name bharatmanch-db \
  -e POSTGRES_USER=bharatmanch \
  -e POSTGRES_PASSWORD=bharatmanch_secret \
  -e POSTGRES_DB=bharatmanch \
  -p 5432:5432 \
  postgres:17-alpine
```

### Run the Backend API

```bash
cd server
bun install
bunx prisma generate
bunx prisma migrate dev
bun run dev
```

### Run the Frontend Client

```bash
cd client
npm install # or bun install / pnpm install
npm run dev
```

---

## Development Principles

* Clear separation: **controller → service → data layer** (Backend)
* No business logic inside routes
* Strong typing everywhere (TypeScript)
* Fail fast, log properly

---

## Roadmap

* [ ] Auth system (access + refresh tokens)
* [ ] Video upload (multipart + B2)
* [ ] Async processing pipeline (FFmpeg + queue)
* [ ] Streaming (HLS)
* [ ] Engagement system (likes, comments, subs)
* [ ] Rate limiting & security hardening

---

## Contributing

PRs are welcome. Keep code clean, typed, and modular.

---

## License

MIT
