# GitHub Trending Summarizer

A web application that helps developers discover and track trending GitHub repositories through daily feeds, AI-powered summaries, and personalized insights.

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Rust (1.75+)
- Node.js (18+)
- PostgreSQL (15+)

### Quick Start

1. Clone the repository
2. Run the development setup script:
   ```bash
   ./scripts/dev-setup.sh
   ```
3. Start the backend:
   ```bash
   cd backend && cargo run
   ```
4. Start the frontend (in another terminal):
   ```bash
   cd frontend && npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5434
- Redis: localhost:6379

### Local Development

#### Backend (Rust)

```bash
cd backend
cargo run
```

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# Run migrations
diesel migration run

# Revert migrations
diesel migration revert
```

## Project Structure

```
├── backend/           # Rust backend with Rocket framework
├── frontend/          # Next.js frontend with TailwindCSS
├── docker-compose.yml # Development environment setup
└── README.md
```

## Tech Stack

- **Backend**: Rust, Rocket, Diesel ORM, PostgreSQL
- **Frontend**: Next.js, React, TailwindCSS, HeadlessUI
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker, Docker Compose
