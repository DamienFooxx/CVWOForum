package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
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

	return &Config{
		Port: port,
	}, nil
}
