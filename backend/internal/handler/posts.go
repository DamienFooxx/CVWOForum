package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/DamienFooxx/CVWOForum/internal/auth"
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type PostHandler struct {
	q *database.Queries
}

func NewPostHandler(q *database.Queries) *PostHandler {
	return &PostHandler{q: q}
}

// CreatePost POST /topics/{topicID}/posts
func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	// Get UserID
	userID, ok := r.Context().Value(auth.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Get TopicID
	topicIDStr := chi.URLParam(r, "topicID") // Simple parsing of topicId from URL given by router
	topicID, err := strconv.ParseInt(topicIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid topicID", http.StatusBadRequest)
		return
	}

	// Parse request body
	type Request struct {
		Title string `json:"title"`
		Body  string `json:"body"`
	}
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Body == "" {
		http.Error(w, "Title and body are required", http.StatusBadRequest)
		return
	}

	// Write to db
	post, err := h.q.CreatePost(r.Context(), database.CreatePostParams{
		TopicID:   topicID,
		CreatedBy: userID,
		Title:     req.Title,
		Body:      req.Body,
	})
	if err != nil {
		http.Error(w, "Failed to create post"+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create Response
	type Response struct {
		PostID    int64  `json:"post_id"`
		TopicID   int64  `json:"topic_id"`
		Title     string `json:"title"`
		Body      string `json:"body"`
		CreatedAt string `json:"created_at"`
		CreatedBy int64  `json:"created_by"`
		Status    string `json:"status"`
	}
	resp := Response{
		PostID:    post.PostID,
		TopicID:   post.TopicID,
		Title:     post.Title,
		Body:      post.Body,
		CreatedAt: post.CreatedAt.Time.Format(time.RFC3339),
		CreatedBy: post.CreatedBy,
		Status:    post.Status.String,
	}

	// Return Response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		fmt.Printf("Failed to encode response: %v\n", err)
	}
}

// SearchPostsGlobal GET /posts (?q=search)
func (h *PostHandler) SearchPostsGlobal(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	posts, err := h.q.SearchPostsGlobal(r.Context(), pgtype.Text{String: query, Valid: true})
	if err != nil {
		http.Error(w, "Failed to search posts: "+err.Error(), http.StatusInternalServerError)
		return
	}
	type Response struct {
		PostID    int64  `json:"post_id"`
		TopicID   int64  `json:"topic_id"`
		Title     string `json:"title"`
		Body      string `json:"body"`
		CreatedAt string `json:"created_at"`
		CreatedBy int64  `json:"created_by"`
		Status    string `json:"status"`
	}

	response := []Response{}

	for _, post := range posts {
		response = append(response, Response{
			PostID:    post.PostID,
			TopicID:   post.TopicID,
			Title:     post.Title,
			Body:      post.Body,
			CreatedAt: post.CreatedAt.Time.Format(time.RFC3339),
			CreatedBy: post.CreatedBy,
			Status:    post.Status.String,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// SearchPostsTopics GET /topics/{topicID}/posts
func (h *PostHandler) SearchPostsTopics(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	// Get TopicID
	topicIDStr := chi.URLParam(r, "topicID") // Simple parsing of topicId from URL given by router
	topicID, err := strconv.ParseInt(topicIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid topicID", http.StatusBadRequest)
		return
	}

	type Response struct {
		PostID    int64  `json:"post_id"`
		TopicID   int64  `json:"topic_id"`
		Title     string `json:"title"`
		Body      string `json:"body"`
		CreatedAt string `json:"created_at"`
		CreatedBy int64  `json:"created_by"`
		Status    string `json:"status"`
	}
	response := []Response{}

	if query != "" {
		// Fuzzy Search for posts within the topic
		posts, err := h.q.SearchPostsInTopic(r.Context(), database.SearchPostsInTopicParams{
			TopicID: topicID,
			Column2: pgtype.Text{String: query, Valid: true},
		})
		if err != nil {
			http.Error(w, "Failed to search posts in topic: "+err.Error(), http.StatusInternalServerError)
			return
		}
		for _, p := range posts {
			response = append(response, Response{
				PostID:    p.PostID,
				TopicID:   p.TopicID,
				Title:     p.Title,
				Body:      p.Body,
				CreatedAt: p.CreatedAt.Time.Format(time.RFC3339),
				CreatedBy: p.CreatedBy,
				Status:    p.Status.String,
			})
		}
	} else {
		// List all posts in the topic
		posts, err := h.q.ListPostsInTopic(r.Context(), topicID)
		if err != nil {
			http.Error(w, "Failed to list posts in topic: "+err.Error(), http.StatusInternalServerError)
			return
		}
		for _, p := range posts {
			response = append(response, Response{
				PostID:    p.PostID,
				TopicID:   p.TopicID,
				Title:     p.Title,
				Body:      p.Body,
				CreatedAt: p.CreatedAt.Time.Format(time.RFC3339),
				CreatedBy: p.CreatedBy,
				Status:    p.Status.String,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// GetPost GET /posts/{postID}
func (h *PostHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	postIDStr := chi.URLParam(r, "postID")
	postID, err := strconv.ParseInt(postIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid Post ID", http.StatusBadRequest)
		return
	}

	post, err := h.q.GetPost(r.Context(), postID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Post not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to get post", http.StatusInternalServerError)
		}
		return
	}

	type Response struct {
		PostID    int64  `json:"post_id"`
		TopicID   int64  `json:"topic_id"`
		Title     string `json:"title"`
		Body      string `json:"body"`
		CreatedAt string `json:"created_at"`
		CreatedBy int64  `json:"created_by"`
		Status    string `json:"status"`
	}

	resp := Response{
		PostID:    post.PostID,
		TopicID:   post.TopicID,
		Title:     post.Title,
		Body:      post.Body,
		CreatedAt: post.CreatedAt.Time.Format(time.RFC3339),
		CreatedBy: post.CreatedBy,
		Status:    post.Status.String,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}
