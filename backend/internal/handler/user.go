package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/DamienFooxx/CVWOForum/internal/auth"
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/jackc/pgx/v5"
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

	// Write to database
	user, err := h.q.CreateUser(r.Context(), database.CreateUserParams{
		Username: req.Username,
		Bio:      req.Bio, // postgres defaults to '' if not provided
	})
	if err != nil {
		http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	// Convert back to JSON
	if err := json.NewEncoder(w).Encode(user); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// Login handles POST /login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	type Request struct {
		Username string `json:"username"`
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if req.Username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	// Find user by username
	user, err := h.q.GetUserByUsername(r.Context(), req.Username)
	var userId int64

	if err != nil {
		// If user has not been created before, create them
		if errors.Is(err, pgx.ErrNoRows) {
			// Create User
			newUser, err := h.q.CreateUser(r.Context(), database.CreateUserParams{
				Username: req.Username,
				Bio:      "",
			})
			if err != nil {
				http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
				return
			}
			userId = newUser.UserID
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		userId = user.UserID
	}

	// Generate token
	token, err := auth.GenerateToken(userId)
	if err != nil {
		http.Error(w, "Failed to generate token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"token":    token,
		"username": req.Username,
		"user_id":  userId,
	}); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}
