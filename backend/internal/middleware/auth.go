package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/DamienFooxx/CVWOForum/internal/auth"
)

/**
Intercepts the HTTP request
Checks for Authorisation
Validates the Token
Extracts user_id
Puts user_id into the request context for handlers
*/

// AuthMiddleware verifies the JWT Token
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Header format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}
		// Extract token
		tokenString := parts[1]
		userID, err := auth.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), auth.UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
