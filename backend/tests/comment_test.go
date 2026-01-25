package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DamienFooxx/CVWOForum/internal/database"
	"github.com/DamienFooxx/CVWOForum/internal/router"
	"github.com/stretchr/testify/assert"
)

func TestComments(t *testing.T) {
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
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		if err != nil {
			return ""
		}
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
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		if err != nil {
			return 0
		}
		return int64(resp["topic_id"].(float64))
	}

	createPost := func(token string, topicID int64, title, body string) int64 {
		payload := []byte(fmt.Sprintf(`{"title": "%s", "body": "%s"}`, title, body))
		url := fmt.Sprintf("/topics/%d/posts", topicID)
		req := httptest.NewRequest("POST", url, bytes.NewBuffer(payload))
		req.Header.Set("Content-Type", "application/json")
		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		if err != nil {
			return 0
		}
		return int64(resp["post_id"].(float64))
	}

	createComment := func(token string, postId int64, body string, parentID *int64) *httptest.ResponseRecorder {
		data := map[string]interface{}{
			"body": body,
		}
		if parentID != nil {
			data["parent_id"] = *parentID
		}
		payload, _ := json.Marshal(data)

		url := fmt.Sprintf("/posts/%d/comments", postId)
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
	postId := createPost(token, topicID, "testPost", "testPostBody")

	// Store parent comment id
	var TopCommentID int64

	// Test Case 1: Create Comment
	t.Run("Create Comment", func(t *testing.T) {
		w := createComment(token, postId, "testComment", nil)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Equal(t, "testComment", resp["body"])
		assert.Nil(t, resp["parent_id"])

		TopCommentID = int64(resp["comment_id"].(float64))
	})

	// Test Case 2: Create Reply
	t.Run("Create Reply", func(t *testing.T) {
		w := createComment(token, postId, "Reply to First", &TopCommentID)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Equal(t, "Reply to First", resp["body"])
		assert.Equal(t, float64(TopCommentID), resp["parent_id"])
	})

	// Test Case 3: List Comments
	t.Run("List Comments", func(t *testing.T) {
		url := fmt.Sprintf("/posts/%d/comments", postId)
		req := httptest.NewRequest("GET", url, nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)

		assert.Len(t, resp, 2)
		// Check order
		assert.Equal(t, "testComment", resp[0]["body"])
		assert.Equal(t, "Reply to First", resp[1]["body"])
	})

	// Test Case 4: Delete Comment
	t.Run("Delete Comment", func(t *testing.T) {
		// Create a comment to delete
		wcreate := createComment(token, postId, "deleteMe", nil)
		var createResp map[string]interface{}
		err := json.Unmarshal(wcreate.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		commentID := int64(createResp["comment_id"].(float64))

		// Delete it
		url := fmt.Sprintf("/comments/%d", commentID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		// Verify it's deleted (ListComments should show status removed)
		urlList := fmt.Sprintf("/posts/%d/comments", postId)
		reqList := httptest.NewRequest("GET", urlList, nil)
		wList := httptest.NewRecorder()
		r.ServeHTTP(wList, reqList)

		var listResp []map[string]interface{}
		err = json.Unmarshal(wList.Body.Bytes(), &listResp)
		assert.NoError(t, err)

		// Find the deleted comment
		found := false
		for _, c := range listResp {
			if int64(c["comment_id"].(float64)) == commentID {
				assert.Equal(t, "removed", c["status"])
				found = true
				break
			}
		}
		assert.True(t, found, "Deleted comment should still be listed but with status removed")
	})

	// Test Case 5: Delete Comment Non-Creator
	t.Run("Delete Comment Non-Creator", func(t *testing.T) {
		// Create a comment by user1
		wcreate := createComment(token, postId, "user1Comment", nil)
		var createResp map[string]interface{}
		err := json.Unmarshal(wcreate.Body.Bytes(), &createResp)
		assert.NoError(t, err)
		commentID := int64(createResp["comment_id"].(float64))

		// Register user2
		payload := []byte(`{
			"username": "user2_comment",
			"password": "password",
			"bio": "bio"
		}`)
		reqReg, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(payload))
		reqReg.Header.Set("Content-Type", "application/json")
		wReg := httptest.NewRecorder()
		r.ServeHTTP(wReg, reqReg)

		token2 := getToken("user2_comment")

		// Try to delete user1's comment with user2's token
		url := fmt.Sprintf("/comments/%d", commentID)
		req := httptest.NewRequest("DELETE", url, nil)
		req.Header.Set("Authorization", "Bearer "+token2)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})
}
