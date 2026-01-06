package main

import (
	"fmt"
	"net/http"

	"github.com/DamienFooxx/CVWOForum/internal/config"
	"github.com/DamienFooxx/CVWOForum/internal/db"
	"github.com/DamienFooxx/CVWOForum/internal/router"
)

func main() {
	// Initialise .env vars into environment
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	// Initialise database using internal/db/db.go
	database, err := db.NewDB(cfg.DatabaseURL)
	if err != nil {
		panic(err)
	}
	// Close db connection once main() stops
	defer database.Close()
	fmt.Println("Connected to database at", cfg.DatabaseURL)

	// Initialise chi router using internal/router/router.go New() function
	r := router.NewRouter()
	addr := ":" + cfg.Port
	fmt.Println("listening on", addr)

	// Start HTTP server
	if err := http.ListenAndServe(addr, r); err != nil {
		panic(err)
	}
}
