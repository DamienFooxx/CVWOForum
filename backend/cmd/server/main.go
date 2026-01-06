package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

func main() {
	// Initialise .env vars into environment
	_ = godotenv.Load()
	// Initialise chi router
	r := chi.NewRouter()

	// Create health route
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		panic("PORT environment variable not set")
	}
	addr := ":" + port
	fmt.Println("listening on", addr)

	// Start HTTP server
	if err := http.ListenAndServe(addr, r); err != nil {
		panic(err)
	}
}
