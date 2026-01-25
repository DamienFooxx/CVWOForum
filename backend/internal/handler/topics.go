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

type TopicHandler struct {
	q *database.Queries
}

func NewTopicHandler(q *database.Queries) *TopicHandler {
	return &TopicHandler{q: q}
}

// CreateTopic POST /topics
func (h *TopicHandler) CreateTopic(w http.ResponseWriter, r *http.Request) {
	// Get UserID from Context
	userID, ok := r.Context().Value(auth.UserIDKey).(int64)
	if !ok {
		http.Error(w, "User ID not found in context", http.StatusInternalServerError)
		return
	}

	// Parse json request body
	type Request struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Enforce name and description are provided
	if req.Name == "" || req.Description == "" {
		http.Error(w, "Name and Description are required", http.StatusBadRequest)
		return
	}

	// Write to database
	topic, err := h.q.CreateTopic(r.Context(), database.CreateTopicParams{
		CreatedBy:   userID,
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		http.Error(w, "Failed to create topic: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Response
	type Response struct {
		TopicID     int64  `json:"topic_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
        PostCount   int64  `json:"post_count"`
	}

	// Construct Response
	response := Response{
		TopicID:     topic.TopicID,
		Name:        topic.Name,
		Description: topic.Description,
		CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
		Status:      topic.Status,
        PostCount:   0,
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// SearchTopics GET /topics (handles ?q=search Fuzzy Search)
func (h *TopicHandler) SearchTopics(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	type Response struct {
		TopicID     int64  `json:"topic_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
        PostCount   int64  `json:"post_count"`
	}

	response := []Response{}
	if query != "" {
		// Fuzzy Search for topics
		topics, err := h.q.SearchTopics(r.Context(), pgtype.Text{String: query, Valid: true})
		if err != nil {
			http.Error(w, "Failed to search topics: "+err.Error(), http.StatusInternalServerError)
			return
		}
		for _, topic := range topics {
			response = append(response, Response{
				TopicID:     topic.TopicID,
				Name:        topic.Name,
				Description: topic.Description,
				CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
				Status:      topic.Status,
                PostCount:   topic.PostCount.Int64,
			})
		}
	} else {
		// List All
		topics, err := h.q.ListTopics(r.Context())
		if err != nil {
			http.Error(w, "Failed to list topics: "+err.Error(), http.StatusInternalServerError)
			return
		}
		for _, topic := range topics {
			response = append(response, Response{
				TopicID:     topic.TopicID,
				Name:        topic.Name,
				Description: topic.Description,
				CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
				Status:      topic.Status,
                PostCount:   topic.PostCount.Int64,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// GetTopic GET /topics/{topicID}
func (h *TopicHandler) GetTopic(w http.ResponseWriter, r *http.Request) {
	// Get TopicID
	topicIDStr := chi.URLParam(r, "topicID")
	topicID, err := strconv.ParseInt(topicIDStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid topicID", http.StatusBadRequest)
		return
	}

	// Fetch topic
	topic, err := h.q.GetTopic(r.Context(), topicID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "Topic not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to get topic", http.StatusInternalServerError)
		return
	}

	// Create Response
	type Response struct {
		TopicID     int64  `json:"topic_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
        PostCount   int64  `json:"post_count"`
	}

	resp := Response{
		TopicID:     topic.TopicID,
		Name:        topic.Name,
		Description: topic.Description,
		CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
		Status:      topic.Status,
        PostCount:   topic.PostCount.Int64,
	}

	// Send Response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		fmt.Printf("Failed to encode response: %v\n", err)
	}
}
