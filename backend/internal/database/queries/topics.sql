-- name: CreateTopic :one
INSERT INTO topics (created_by, name, description)
VALUES ($1, $2, $3)
RETURNING topic_id, created_by, name, description, created_at, status;

-- name: ListTopics :many
SELECT topic_id, created_by, name, description, created_at, status
FROM topics
WHERE status = 'active'
ORDER BY created_at DESC;

-- name: GetTopic :one
SELECT topic_id, created_by, name, description, created_at, status
FROM topics
WHERE topic_id = $1;