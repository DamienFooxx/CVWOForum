package middleware

import (
	"net/http"
	"os"

	"github.com/go-chi/cors"
)

// CorsMiddleware configures and returns the CORS middleware to allow the frontend to connect
func CorsMiddleware() func(handler http.Handler) http.Handler {
	allowedOrigins := []string{"http://localhost:3000"} // Default dev origins

	if os.Getenv("FRONTEND_URL") != "" {
		allowedOrigins = append(allowedOrigins, os.Getenv("FRONTEND_URL"))
	}

	return cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
}
