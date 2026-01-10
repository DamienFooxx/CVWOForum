package tests

import (
	"context"
	"testing"

	"github.com/DamienFooxx/CVWOForum/internal/config"
	"github.com/DamienFooxx/CVWOForum/internal/dbConnection"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SetupDB connects to the test database and returns the pool and a clean-up function
func SetupDB(t *testing.T) *pgxpool.Pool {
	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	db, err := dbConnection.NewDB(cfg.DatabaseURL)
	if err != nil {
		t.Fatalf("Failed to connect to DB: %v", err)
	}

	return db
}

// ClearDB truncates all tables to ensure a clean state
func ClearDB(t *testing.T, db *pgxpool.Pool) {
	_, err := db.Exec(context.Background(), "TRUNCATE users, topics CASCADE")
	if err != nil {
		t.Fatalf("Failed to clear DB: %v", err)
	}
}
