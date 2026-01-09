DB_URL="postgres://damienfoo:password@localhost:5432/cvwo_forum?sslmode=disable"

# Run all migrations up
migrate-up:
	cd migrations && goose postgres $(DB_URL) up

# Rollback all migrations (down to 0)
migrate-down:
	cd migrations && goose postgres $(DB_URL) down-to 0

# Reset DB: Down to 0, then Up
db-reset: migrate-down migrate-up

# Generate sqlc code
gen:
	sqlc generate

# Run tests
test:
	go test -v ./tests/...

.PHONY: migrate-up migrate-down db-reset gen test