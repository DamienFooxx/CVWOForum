package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/router"
	"github.com/stretchr/testify/assert"
)

func TestPosts(t *testing.T) {
	// Setup
	dbConn := SetupDB(t)
	defer dbConn.Close()
	ClearDB(t, dbConn)

	queries := database.New(dbConn)
	r := router.NewRouter(queries)

	// Helpers
	getToken := func(username string) string {
		payload := []byte(`{"username": "` + username + `"}`)
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		var resp map[string]string
		json.Unmarshal(w.Body.Bytes(), &resp)
		return resp["token"]
	}

	createTopic := func(token, name, desc string) int64 {
		payload := []byte(`{"name": "` + name + `", "description": "Desc"}`)
		req := httptest.NewRequest("POST", "/topics", bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		return int64(resp["topic_id"].(float64))
	}

	createPost := func(token string, topicID int64, title, body string) *httptest.ResponseRecorder {
		payload := []byte(fmt.Sprintf(`{"title": "%s", "body": "%s"}`, title, body))
		url := fmt.Sprintf("/topics/%d/posts", topicID)
		req := httptest.NewRequest("POST", url, bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}

	token := getToken("testUser")
	topicID := createTopic(token, "testTopic", "testDescription")

	// Test Case 1: Create Post
	t.Run("Create Post", func(t *testing.T) {
		w := createPost(token, topicID, "testPost", "testPostBody")
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Equal(t, "testPost", resp["title"])
		assert.Equal(t, "testPostBody", resp["body"])
	})

	// Test Case 2: Create Post Unauthorized.
	t.Run("Create Post Unauthorized", func(t *testing.T) {
		w := createPost("", topicID, "testPostUnauthorized", "testPostBodyUnauthorized")

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test Case 3: Lists Posts Globally
	t.Run("List Posts Globally", func(t *testing.T) {
		// Create another topic and post
		time.Sleep(1 * time.Second) // To force different CreateAt timestamps
		topicID2 := createTopic(token, "testTopic2", "testDescription2")
		createPost(token, topicID2, "testPost1 from Topic2", "testPostBody3")

		req := httptest.NewRequest("GET", "/posts?q=testPost", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp []map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Len(t, resp, 2)
		assert.Equal(t, "testPost1 from Topic2", resp[0]["title"])
		assert.Equal(t, "testPost", resp[1]["title"])
	})

	// Test Case 4: Lists Posts in Topic
	t.Run("List Posts in Topic", func(t *testing.T) {
		time.Sleep(1 * time.Second) // To force different CreateAt timestamps
		w := createPost(token, topicID, "testPost2", "testPostBody2")
		assert.Equal(t, http.StatusOK, w.Code)

		url := fmt.Sprintf("/topics/%d/posts", topicID)
		req := httptest.NewRequest("GET", url, nil)
		wCurr := httptest.NewRecorder()
		r.ServeHTTP(wCurr, req)

		assert.Equal(t, http.StatusOK, wCurr.Code)
		var resp []map[string]interface{}
		json.Unmarshal(wCurr.Body.Bytes(), &resp)

		assert.Len(t, resp, 2)
		assert.Equal(t, "testPost2", resp[0]["title"])
		assert.Equal(t, "testPost", resp[1]["title"])
	})
}
