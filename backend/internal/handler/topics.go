package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/DamienFooxx/CVWOForum/internal/auth"
	"github.com/DamienFooxx/CVWOForum/internal/database"
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
	}

	// Construct Response
	response := Response{
		TopicID:     topic.TopicID,
		Name:        topic.Name,
		Description: topic.Description,
		CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
		Status:      topic.Status.String,
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}

// ListTopics GET /topics
func (h *TopicHandler) ListTopics(w http.ResponseWriter, r *http.Request) {
	topics, err := h.q.ListTopics(r.Context())
	if err != nil {
		http.Error(w, "Failed to list topics: "+err.Error(), http.StatusInternalServerError)
		return
	}

	type Response struct {
		TopicID     int64  `json:"topic_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
		CreatedAt   string `json:"created_at"`
		Status      string `json:"status"`
	}

	// Initialise empty slice so that json is [] instead of null in the case of no topic
	response := []Response{}
	for _, topic := range topics {
		response = append(response, Response{
			TopicID:     topic.TopicID,
			Name:        topic.Name,
			Description: topic.Description,
			CreatedAt:   topic.CreatedAt.Time.Format(time.RFC3339),
			Status:      topic.Status.String,
		})
	}

	// Return HTTP response
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("Error encoding JSON: %v\n", err)
	}
}
