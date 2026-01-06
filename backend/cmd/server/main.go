package main

import (
	"fmt"
	"net/http"

	"github.com/DamienFooxx/CVWOForum/internal/config"
	"github.com/DamienFooxx/CVWOForum/internal/router"
)

func main() {
	// Initialise .env vars into environment
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	// Initialise chi router using internal/router.go New() function
	r := router.New()

	addr := ":" + cfg.Port
	fmt.Println("listening on", addr)

	// Start HTTP server
	if err := http.ListenAndServe(addr, r); err != nil {
		panic(err)
	}
}
