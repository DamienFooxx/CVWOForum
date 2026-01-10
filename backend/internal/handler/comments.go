package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/DamienFooxx/CVWOForum/internal/auth"
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type CommentHandler struct {
	q *database.Queries
}

func NewCommentHandler(q *database.Queries) *CommentHandler {
	return &CommentHandler{q: q}
}

// CreateComment POST /posts/{postID}/comments
func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	// Authentication
	userID, ok := r.Context().Value(auth.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Get PostID
	postIDStr := chi.URLParam(r, "postID")
	postID, err := strconv.ParseInt(postIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid Post ID", http.StatusBadRequest)
		return
	}

	// Parse request body
	type Request struct {
		Body     string `json:"body"`
		ParentID *int64 `json:"parent_id"` // Nullable, only for replies to comments
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Body == "" {
		http.Error(w, "Body is required", http.StatusBadRequest)
		return
	}

	// Handle ParentID
	// pgtype.Int8 is used for it to be nullable in DB, int64 defaults to 0 which can cause issues
	var parentID pgtype.Int8
	if req.ParentID != nil {
		parentID = pgtype.Int8{Int64: *req.ParentID, Valid: true}
	} else {
		parentID = pgtype.Int8{Valid: false}
	}

	// Write to db
	comment, err := h.q.CreateComment(r.Context(), database.CreateCommentParams{
		PostID:      postID,
		CommentedBy: userID,
		ParentID:    parentID,
		Body:        req.Body,
	})
	if err != nil {
		http.Error(w, "Failed to create comment"+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create Response
	type Response struct {
		CommentID   int64  `json:"comment_id"`
		PostID      int64  `json:"post_id"`
		CommentedBy int64  `json:"commented_by"`
		ParentID    *int64 `json:"parent_id"`
		Body        string `json:"body"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
	}

	var respParentID *int64
	if comment.ParentID.Valid {
		respParentID = &comment.ParentID.Int64
	}

	resp := Response{
		CommentID:   comment.CommentID,
		PostID:      comment.PostID,
		CommentedBy: comment.CommentedBy,
		ParentID:    respParentID,
		Body:        comment.Body,
		CreatedAt:   comment.CreatedAt.Time.Format(time.RFC3339),
		Status:      comment.Status,
	}

	// Return Response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// ListComments GET /posts/{postID}/comments
func (h *CommentHandler) ListComments(w http.ResponseWriter, r *http.Request) {
	// Get PostID
	postIDStr := chi.URLParam(r, "postID")
	postID, err := strconv.ParseInt(postIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid Post ID", http.StatusBadRequest)
		return
	}

	// Call Database
	comments, err := h.q.ListCommentsByPost(r.Context(), postID)
	if err != nil {
		http.Error(w, "Failed to list comments"+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create Response
	type Response struct {
		CommentID   int64  `json:"comment_id"`
		PostID      int64  `json:"post_id"`
		CommentedBy int64  `json:"commented_by"`
		ParentID    *int64 `json:"parent_id"`
		Body        string `json:"body"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
	}

	response := []Response{}
	for _, c := range comments {
		var respParentID *int64
		if c.ParentID.Valid {
			respParentID = &c.ParentID.Int64
		}
		response = append(response, Response{
			CommentID:   c.CommentID,
			PostID:      c.PostID,
			CommentedBy: c.CommentedBy,
			ParentID:    respParentID,
			Body:        c.Body,
			CreatedAt:   c.CreatedAt.Time.Format(time.RFC3339),
			Status:      c.Status,
		})
	}

	// Return Response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
