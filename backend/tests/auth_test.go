package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/router"
	"github.com/stretchr/testify/assert"
)

// Test login functions using JWT
func TestLogin(t *testing.T) {
	err := os.Setenv("JWT_SECRET", "secret")
	if err != nil {
		t.Fatalf("Failed to set JWT_SECRET: %v", err)
		return
	}
	// Setup
	dbConn := SetupDB(t)
	defer dbConn.Close()

	queries := database.New(dbConn)
	r := router.NewRouter(queries)

	// Clear DB
	ClearDB(t, dbConn)
	// Test login
	// Test Case 1: Login New User
	t.Run("Login New User", func(t *testing.T) {
		payload := []byte(`{
			"username": "testuser"
		}`)
		req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(payload))
		if err != nil {
			t.Fatalf("Failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Check successful creation and login
		assert.NotEmpty(t, response["token"])
		assert.Equal(t, "testuser", response["username"])
	})

	// Test Case 2: Login Existing User
	t.Run("Login Existing User", func(t *testing.T) {
		payload := []byte(`{
			"username": "testuser"
		}`)
		req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(payload))
		if err != nil {
			t.Fatalf("Failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Check successful login
		assert.NotEmpty(t, response["token"])
		assert.Equal(t, "testuser", response["username"])
	})

	// Test Case 3: Invalid Request by Empty Username
	t.Run("Login Empty Username", func(t *testing.T) {
		payload := []byte(`{
			"username": ""
		}`)
		req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(payload))
		if err != nil {
			t.Fatalf("Failed to create request: %v", err)
		}

		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		// Check if bad request was sent back
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
