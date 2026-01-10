package dbConnection

import (
	"context"
	"fmt"
	"time"

	// Import to use pgx as the driver name
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewDB starts connection to the database
func NewDB(databaseURL string) (*pgxpool.Pool, error) {
	// Parse configuration
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// Create connection pool
	ctx := context.Background() // Create context for connection to be root connection
	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Verify connection to database at startup
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second) // Ensures there is no infinite hang if ping fails.
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}
