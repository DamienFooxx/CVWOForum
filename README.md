# Forum Platform

## User Stories

* “I want to be able to see a year-in-review of my contributions to each topic in the forum.”
* “I want to be able to check if a post is legit — whether the poster is generally truthful or known for false statements.”
* “I want to be able to edit my posts easily.”
* “I want more than simple likes or dislikes. I want richer reactions.”

## Overall Goal

A modern forum platform designed to enhance engagement, credibility, and user experience through analytics, trust metrics, and strong moderation tools.

## Tech Stack

### Frontend

* React.js
* TypeScript

### Backend

* Go (Golang)
* PostgreSQL

### Authentication

* Username + JWT (Implemented)
* Google OAuth 2.0 (Planned)

### Deployment & Infrastructure

* Hosting: Google Cloud Platform
* Containerisation: Docker
* CI/CD: GitHub Actions

## Features (Current Status)

### ✅ Implemented (Backend)
*   **Authentication**:
    *   Username-only login (Passwordless/Simple).
    *   JWT-based session management.
*   **Users**:
    *   Registration and Login.
*   **Topics**:
    *   Create Topics (Protected).
    *   List Topics (Public).
    *   Fuzzy Search Topics (`?q=...`).
*   **Posts**:
    *   Create Posts in Topics (Protected).
    *   List Posts by Topic.
    *   Global Feed (List All Posts).
    *   Fuzzy Search Posts (Global & Per-Topic).
*   **Testing**:
    *   Robust integration tests for all features using `testify` and `pgx`.

### 🚧 In Progress / Planned
*   Comments
*   Reactions
*   Contribution/Reputation Scores
*   Frontend Integration

## Project Structure (Backend)

```
backend/
├── cmd/server/         # Application entry point
├── internal/
│   ├── auth/           # JWT authentication logic
│   ├── config/         # Configuration loading
│   ├── database/       # Generated SQLC code (Queries & Models)
│   ├── dbConnection/   # Database connection setup
│   ├── handler/        # HTTP Handlers (User, Topic, Post)
│   ├── middleware/     # HTTP Middleware (Auth)
│   └── router/         # Route definitions (Chi)
├── migrations/         # SQL Migrations (Goose)
├── tests/              # Integration tests
├── Makefile            # Build and utility commands
└── sqlc.yaml           # SQLC configuration
```

## Getting Started (Backend)

### Prerequisites
*   Go 1.25+
*   Docker & Docker Compose
*   Make (Optional but recommended)

### Setup
1.  **Start Database**:
    ```sh
    docker-compose up -d
    ```
2.  **Run Migrations**:
    ```sh
    cd backend
    make migrate-up
    ```
3.  **Run Server**:
    ```sh
    go run cmd/server/main.go
    ```

### Testing
Run the integration test suite:
```sh
cd backend
make test
```

### Linting
```sh
cd backend
make lint
```

## Database UML

./Database.drawio

## Libraries

### Backend (Go)

* Routing: **chi**
* Database: **pgx + sqlc**
  * pgx > in-built go sql: Built for psql, so it is faster and supports more advanced psql commands.
  * pgxPool minimize the overhead of connection handshakes and authentication by having multiple open connections.
  * pgx provides better type safety when working with sqlc.
* Migrations: **goose**
* Auth: **golang-jwt/jwt/v5**
* Config: **godotenv**
* Testing: **testify**

### Frontend (React + TypeScript)

* Routing: **react-router**
* Server State: **react-query**
* Forms: **react-hook-form + zod**
* UI: **MUI**

## Build Timeline

| Phase              | Dates          | Goal                        |
| ------------------ | -------------- | --------------------------- |
| Phase 0            | 15–17 Dec      | Foundation & Design         |
| Phase 1            | 18–27 Dec      | Core Backend + DB           |
| Phase 2            | 28 Dec – 3 Jan | Core Frontend + Integration |
| **MID SUBMISSION** | **4 Jan**      | **End-to-End MVP**          |
| Phase 3            | 5–12 Jan       | Engagement Features         |
| Phase 4            | 13–20 Jan      | Trust, Analytics, Polish    |
| Phase 5            | 21–25 Jan      | Hardening & Demo Readiness  |
