DB_URL="postgres://damienfoo:password@localhost:5432/cvwo_forum?sslmode=disable"

# Run all migrations up
migrate-up:
	cd backend/migrations && goose postgres $(DB_URL) up

# Rollback all migrations (down to 0)
migrate-down:
	cd backend/migrations && goose postgres $(DB_URL) down-to 0

# Reset DB: Down to 0, then Up
db-reset: migrate-down migrate-up

# Generate sqlc code
gen:
	cd backend && sqlc generate

# Run tests
test:
	cd backend && go test -v ./tests/...

.PHONY: migrate-up migrate-down db-reset gen test

# Run linter
lint:
	cd backend && golangci-lint run

# Run Server
run: 
	cd backend && go run ./cmd/server/main.go