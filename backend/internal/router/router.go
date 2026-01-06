package router

import (
	"github.com/DamienFooxx/CVWOForum/internal/handler"
	"github.com/go-chi/chi/v5"
)

// New initialises and returns new HTTP router
func NewRouter() *chi.Mux {
	// Create the router instance with r var name
	r := chi.NewRouter()

	// register urls
	r.Get("/health", handler.Health)

	return r
}
