package router

import (
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/handler"
	"github.com/DamienFooxx/CVWOForum/internal/middleware"
	"github.com/go-chi/chi/v5"
)

// NewRouter initialises and returns new HTTP router
func NewRouter(queries *database.Queries) *chi.Mux {
	// Create the router instance with r var name
	r := chi.NewRouter()

	// Initialise handlers
	userHandler := handler.NewUserHandler(queries)
	topicHandler := handler.NewTopicHandler(queries)

	// Register urls
	r.Get("/health", handler.Health)
	r.Post("/users", userHandler.CreateUser)
	r.Post("/login", userHandler.Login)
	r.Get("/topics", topicHandler.ListTopics)

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		r.Post("/topics", topicHandler.CreateTopic)
	})

	return r
}
