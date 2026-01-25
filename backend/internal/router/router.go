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

	// Use the CORS middleware
	r.Use(middleware.CorsMiddleware())

	// Initialise handlers
	userHandler := handler.NewUserHandler(queries)
	topicHandler := handler.NewTopicHandler(queries)
	postHandler := handler.NewPostHandler(queries)
	commentHandler := handler.NewCommentHandler(queries)

	// Register URLs
	// Health
	r.Get("/health", handler.Health)

	// Users
	r.Post("/users", userHandler.CreateUser)
	r.Post("/login", userHandler.Login)

	// Topics
	r.Get("/topics", topicHandler.SearchTopics) // Has Fuzzy Search
	r.Get("/topics/{topicID}", topicHandler.GetTopic)

	// Posts
	r.Get("/posts", postHandler.SearchPostsGlobal)
	r.Get("/topics/{topicID}/posts", postHandler.SearchPostsTopics)
	r.Get("/posts/{postID}", postHandler.GetPost)

	// Comments
	r.Get("/posts/{postID}/comments", commentHandler.ListComments)

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		r.Post("/topics", topicHandler.CreateTopic)
		r.Delete("/topics/{topicID}", topicHandler.DeleteTopic)

		r.Post("/topics/{topicID}/posts", postHandler.CreatePost)
		r.Delete("/posts/{postID}", postHandler.DeletePost)

		r.Post("/posts/{postID}/comments", commentHandler.CreateComment)
		r.Delete("/comments/{commentID}", commentHandler.DeleteComment)
	})

	return r
}
