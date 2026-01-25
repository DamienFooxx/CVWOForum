package middleware

import (
	"net/http"

	"github.com/go-chi/cors"
)

// CorsMiddleware configures and returns the CORS middleware to allow the frontend to connect
func CorsMiddleware() func(handler http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // For dev only
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
}
