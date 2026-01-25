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

	// Test Case 4: Test Fuzzy Search
	t.Run("Fuzzy Search", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/topics?q=Topic2", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Len(t, resp, 1)
		assert.Equal(t, "testTopic2", resp[0]["name"])
	})

	// Test Case 5: Get Topic
	t.Run("Get Topic", func(t *testing.T) {
		wcreate := createTopic(token, "testTopic3", "testDescription3")
		var createResp map[string]interface{}
		err := json.Unmarshal(wcreate.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		topicID := int64(createResp["topic_id"].(float64))

		url := fmt.Sprintf("/topics/%d", topicID)
		req := httptest.NewRequest("GET", url, nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Equal(t, float64(topicID), resp["topic_id"])
		assert.Equal(t, "testTopic3", resp["name"])
	})

	// Test Case 6: Delete Topic
	t.Run("Delete Topic", func(t *testing.T) {
		// Create a topic to delete
		wcreate := createTopic(token, "deleteMe", "deleteDescription")
		var createResp map[string]interface{}
		err := json.Unmarshal(wcreate.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		topicID := int64(createResp["topic_id"].(float64))

		// Delete it
		url := fmt.Sprintf("/topics/%d", topicID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Logf("Delete failed with status %d. Body: %s", w.Code, w.Body.String())
		}
		assert.Equal(t, http.StatusOK, w.Code)

		// Verify it's deleted (GetTopic should show status removed)
		reqGet := httptest.NewRequest("GET", url, nil)
		wGet := httptest.NewRecorder()
		r.ServeHTTP(wGet, reqGet)

		assert.Equal(t, http.StatusOK, wGet.Code)
		var getResp map[string]interface{}
		err = json.Unmarshal(wGet.Body.Bytes(), &getResp)
		assert.NoError(t, err)
		assert.Equal(t, "removed", getResp["status"])

		// Verify it's not in ListTopics
		reqList := httptest.NewRequest("GET", "/topics", nil)
		wList := httptest.NewRecorder()
		r.ServeHTTP(wList, reqList)

		var listResp []map[string]interface{}
		err = json.Unmarshal(wList.Body.Bytes(), &listResp)
		assert.NoError(t, err)

		for _, topic := range listResp {
			assert.NotEqual(t, float64(topicID), topic["topic_id"])
		}
	})

	// Test Case 7: Delete Topic by Non-Creator
	t.Run("Delete Topic Non-Creator", func(t *testing.T) {
		// Create a topic by user1
		wcreate := createTopic(token, "user1Topic", "desc")
		var createResp map[string]interface{}
		err := json.Unmarshal(wcreate.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		topicID := int64(createResp["topic_id"].(float64))

		// Create user2
		payload := []byte(`{
			"username": "user2",
			"password": "password",
			"bio": "bio"
		}`)
		reqReg, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(payload))
		reqReg.Header.Set("Content-Type", "application/json")
		wReg := httptest.NewRecorder()
		r.ServeHTTP(wReg, reqReg)

		token2 := getToken("user2")

		// Try to delete user1's topic with user2's token
		url := fmt.Sprintf("/topics/%d", topicID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "Bearer "+token2)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})
}
