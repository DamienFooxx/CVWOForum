-- name: CreatePost :one
INSERT INTO posts (topic_id, created_by, title, body)
VALUES ($1, $2, $3, $4)
RETURNING post_id, topic_id, created_by, title, body, created_at, status;

-- name: ListPostsInTopic :many
SELECT
    p.post_id,
    p.topic_id,
    p.created_by,
    p.title,
    p.body,
    p.created_at,
    p.status,
    u.username
FROM posts p
JOIN users u ON p.created_by = u.user_id
WHERE p.topic_id = $1 AND p.status = 'active'
ORDER BY p.created_at DESC;

-- name: GetPost :one
SELECT
    p.post_id,
    p.topic_id,
    p.created_by,
    p.title,
    p.body,
    p.created_at,
    p.status,
    u.username
FROM posts p
JOIN users u ON p.created_by = u.user_id
WHERE p.post_id = $1;

-- name: SearchPostsGlobal :many
SELECT
    p.post_id,
    p.topic_id,
    p.created_by,
    p.title,
    p.body,
    p.created_at,
    p.status,
    u.username
FROM posts p
JOIN users u ON p.created_by = u.user_id
WHERE
    (p.title ILIKE '%' || $1 || '%' OR p.body ILIKE '%' || $1 || '%')
    AND p.status = 'active'
ORDER BY p.created_at DESC;

-- name: SearchPostsInTopic :many
SELECT
    p.post_id,
    p.topic_id,
    p.created_by,
    p.title,
    p.body,
    p.created_at,
    p.status,
    u.username
FROM posts p
JOIN users u ON p.created_by = u.user_id
WHERE
    p.topic_id = $1
  AND (p.title ILIKE '%' || $2 || '%' OR p.body ILIKE '%' || $2 || '%')
  AND p.status = 'active'
ORDER BY p.created_at DESC;

-- name: DeletePost :one
UPDATE posts
SET status = 'removed', removed_at = NOW(), removed_by = $2
WHERE post_id = $1 AND created_by = $3
RETURNING post_id;
