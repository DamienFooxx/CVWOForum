-- name: CreatePost :one
INSERT INTO posts (topic_id, created_by, title, body)
VALUES ($1, $2, $3, $4)
RETURNING post_id, topic_id, created_by, title, body, created_at, status;

-- name: ListPostsInTopic :many
SELECT post_id, topic_id, created_by, title, body, created_at, status
FROM posts
WHERE topic_id = $1
ORDER BY created_at DESC;

-- name: GetPost :one
SELECT post_id, topic_id, created_by, title, body, created_at, status
FROM posts
WHERE post_id = $1;

-- name: SearchPostsGlobal :many
SELECT post_id, topic_id, created_by, title, body, created_at, status
FROM posts
WHERE
    (title ILIKE '%' || $1 || '%' OR body ILIKE '%' || $1 || '%')
    AND status = 'active'
ORDER BY created_at DESC;

-- name: SearchPostsInTopic :many
SELECT post_id, topic_id, created_by, title, body, created_at, status
FROM posts
WHERE
    topic_id = $1
  AND (title ILIKE '%' || $2 || '%' OR body ILIKE '%' || $2 || '%')
  AND status = 'active'
ORDER BY created_at DESC;