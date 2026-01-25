DB_URL="postgres://damienfoo:password@localhost:5432/cvwo_forum?sslmode=disable"

.PHONY: migrate-up migrate-down db-reset gen test-backend test-frontend test-e2e lint run-backend run-frontend

# --- Database ---
migrate-up:
	cd backend/migrations && goose postgres $(DB_URL) up

migrate-down:
	cd backend/migrations && goose postgres $(DB_URL) down-to 0

db-reset: migrate-down migrate-up

# --- Code Gen ---
gen:
	cd backend && sqlc generate

# --- Testing ---
test-backend:
	cd backend && go test -v ./tests/...

test-frontend:
	cd frontend && npx vitest

test-e2e:
	# Assumes servers are already running, or relies on Playwright config to start them
	cd frontend && npx playwright test

# --- Linting ---
lint:
	cd backend && golangci-lint run

# --- Running ---
# Run backend only
run-backend:
	cd backend && go run ./cmd/server/main.go

# Run frontend only
run-frontend:
	cd frontend && npm run dev