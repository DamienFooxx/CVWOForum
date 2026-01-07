package handler

import (
	"encoding/json"
	"net/http"

	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/jackc/pgx/v5/pgtype"
)

// UserHandler holds the database connection
type UserHandler struct {
	q *database.Queries
}

// NewUserHandler initializes the handler with the required database queries.
func NewUserHandler(q *database.Queries) *UserHandler {
	return &UserHandler{
		q: q,
	}
}

// CreateUser POST /users
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	// Unpack Request, in CreateUser as it is only needed within this function
	type Request struct {
		Username string `json:"username"`
		Bio      string `json:"bio"`
	}

	// Parse json request body
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Create user in database
	// Convert Go string to typesafe for psql
	// Treat empty Bio as "" for simplicity on the frontend
	bioText := pgtype.Text{
		String: req.Bio,
		Valid:  true,
	}

	// Write to database
	user, err := h.q.CreateUser(r.Context(), database.CreateUserParams{
		Username: req.Username,
		Bio:      bioText,
	})
	if err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	// Convert back to JSON
	json.NewEncoder(w).Encode(user)
}
