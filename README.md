# CVWO Forum Platform

This project is a full-stack, discussion-based forum platform. While the original goal was to include advanced reputation systems and extensive moderation, the current implementation focuses on a robust MVP featuring core discussion capabilities: Topics, Posts, Threaded Comments, and Search. The system is built on a type-safe Go backend and a modern React frontend, supported by a PostgreSQL relational database.

## Tech Stack

### Backend
* **Language**: Go (Golang)
* **Routing**: Chi (`github.com/go-chi/chi/v5`)
* **Database Access**: `pgx` with **sqlc** for type-safe code generation
* **Authentication**: JWT-based session management
* **Migrations**: Goose
* **Testing**: Testify (`github.com/stretchr/testify`)

### Frontend
* **Framework**: React.js with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS with a custom **Japandi-style** warm neutral palette
* **State Management**: React Query for server state
* **Form Handling**: React Hook Form
* **Testing**: Vitest and Playwright (E2E)

### Infrastructure
* **Hosting**: Google Cloud Platform (GCP)
* **Containerization**: Docker
* **Web Server**: Nginx configured as a reverse proxy

## Features

* **Topic Management**: Create, view, and soft-delete discussion topics.
* **Post Creation**: Content generation within specific topics with soft-deletion support.
* **Threaded Comments**: Nested replies allowing for structured discussion.
* **Fuzzy Search**: Implemented for both topics and posts using SQL `ILIKE` queries.
* **Authentication**: Username-based login with account auto-creation and JWT persistence.
* **Soft Deletion**: All major entities (topics, posts, comments) utilize a soft-delete mechanism (`status = 'removed'`) to maintain data integrity.

## Testing Locally
Setup a .env file in frontend
```
# Frontend .env
VITE_API_URL=http://localhost:8080
```
```
# Backend .env
PORT=8080
DATABASE_URL=postgres://YOUR_DATABASE_USERNAME:YOUR_DATABASE_PASSWORD:@localhost:5432/cvwo_forum?sslmode=disable
JWT_SECRET=mysecretkey
```

```
docker-compose up -d
make db-reset
cd frontend && npm install
make run-backend
make run-frontend
```