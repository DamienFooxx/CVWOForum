package db

import (
	"database/sql"
	"fmt"

	// Import to use pgx as the driver name
	_ "github.com/jackc/pgx/v5/stdlib"
)

// NewDB starts connection to the database
func NewDB(databaseURL string) (*sql.DB, error) {
	// Initialise database connection
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Verify connection to database at startup
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
