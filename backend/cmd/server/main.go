package main

import (
	"fmt"
	"net/http"

	"github.com/DamienFooxx/CVWOForum/internal/config"
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/dbConnection"
	"github.com/DamienFooxx/CVWOForum/internal/router"
)

func main() {
	// Initialise .env vars into environment
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	// Initialise database using internal/dbConnection/dbConnection.go
	databaseConnection, err := dbConnection.NewDB(cfg.DatabaseURL)
	if err != nil {
		panic(err)
	}
	// Close dbConnection connection once main() stops
	defer databaseConnection.Close()
	fmt.Println("Connected to database at", cfg.DatabaseURL)

	queries := database.New(databaseConnection)

	// Initialise chi router using internal/router/router.go New() function
	r := router.NewRouter(queries)
	addr := ":" + cfg.Port
	fmt.Println("listening on", addr)

	// Start HTTP server
	if err := http.ListenAndServe(addr, r); err != nil {
		panic(err)
	}
}
