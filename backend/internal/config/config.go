package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	FrontendURL string
}

// Load the env vars.
func Load() (*Config, error) {
	// Load local .env file
	_ = godotenv.Load() // ignore error for production

	// Load and check if Port exists
	port := os.Getenv("PORT")
	if port == "" {
		return nil, fmt.Errorf("PORT environment variable not set")
	}

	// Load and check if DatabaseURL exists
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	frontendURL := os.Getenv("FRONTEND_URL")

	return &Config{
		Port:        port,
		DatabaseURL: databaseURL,
		FrontendURL: frontendURL,
	}, nil
}
