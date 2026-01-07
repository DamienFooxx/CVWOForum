package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DamienFooxx/CVWOForum/internal/config"
	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/dbConnection"
	"github.com/DamienFooxx/CVWOForum/internal/router"
	"github.com/stretchr/testify/assert"
)

func TestCreateUser(t *testing.T) {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config because: %v", err)
	}

	// Connect to database
	dbConn, err := dbConnection.NewDB(cfg.DatabaseURL)
	if err != nil {
		t.Fatalf("Failed to connect to database because: %v", err)
	}
	defer dbConn.Close()

	// Clean database for tests
	_, err = dbConn.Exec(context.Background(), "DELETE FROM users;")
	assert.NoError(t, err)

	// Setup router
	queries := database.New(dbConn)
	r := router.NewRouter(queries)

	// Create user
	payload := []byte(`{
		"username": "user1",
		"bio": "test1"
		}`)
	// Create request
	req := httptest.NewRequest("POST", "/users", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")

	// Send request
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Check if success
	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}             // Hold the HTTP response temporarily
	err = json.Unmarshal(w.Body.Bytes(), &response) // Convert to JSON
	assert.NoError(t, err)

	// Username because sqlc converts username to Username for it to be visible to Go
	assert.Equal(t, "user1", response["Username"])
}
