package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/router"
	"github.com/stretchr/testify/assert"
)

func TestTopics(t *testing.T) {
	// Setup
	dbConn := SetupDB(t)
	defer dbConn.Close()
	ClearDB(t, dbConn)

	// Create
	queries := database.New(dbConn)
	r := router.NewRouter(queries)

	// Helper to get token
	getToken := func(username string) string {
		payload := []byte(`{
			"username": "` + username + `"
		}`)

		req, err := http.NewRequest("POST", "/login", bytes.NewBuffer(payload))
		if err != nil {
			t.Fatalf("Failed to create request: %v", err)
		}

		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		var response map[string]string
		if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
			t.Fatalf("Failed to unmarshal response: %v", err)
		}

		return response["token"]
	}

	// Helper to create topic
	createTopic := func(token, name, desc string) *httptest.ResponseRecorder {
		payload := []byte(`{
			"name": "` + name + `", 
			"description": "` + desc + `"
		}`)
		req := httptest.NewRequest("POST", "/topics", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}

	token := getToken("testuser")

	// Test Case 1: Create Topic successfully
	t.Run("Create Topic", func(t *testing.T) {
		w := createTopic(token, "testTopic", "testDescription")
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "testTopic", resp["name"])
		assert.Equal(t, "testDescription", resp["description"])
	})

	// Test Case 2: Create Topic without logging in
	t.Run("Create Topic Without Logging In", func(t *testing.T) {
		w := createTopic("", "NotLoggedIn", "testDescription")
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test Case 3: List Topics
	t.Run("List Topic", func(t *testing.T) {
		// Sleep 1 second to make sure that the timestamps are different
		time.Sleep(1 * time.Second)

		// Create another topic
		w := createTopic(token, "testTopic2", "testDescription2")
		assert.Equal(t, http.StatusOK, w.Code)

		// Now List
		reqCurr := httptest.NewRequest("GET", "/topics", nil)
		wCurr := httptest.NewRecorder()
		r.ServeHTTP(wCurr, reqCurr)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp []map[string]interface{}
		err := json.Unmarshal(wCurr.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, 2, len(resp))

		// Expect DESC order
		assert.Equal(t, "testTopic2", resp[0]["name"])
		assert.Equal(t, "testTopic", resp[1]["name"])
		assert.Equal(t, "testDescription2", resp[0]["description"])
		assert.Equal(t, "testDescription", resp[1]["description"])
	})
}
