-- name: CreateTopic :one
INSERT INTO topics (created_by, name, description)
VALUES ($1, $2, $3)
RETURNING topic_id, created_by, name, description, created_at, status, post_count;

-- name: ListTopics :many
SELECT topic_id, created_by, name, description, created_at, status, post_count
FROM topics
WHERE status = 'active'
ORDER BY created_at DESC;

-- name: GetTopic :one
SELECT topic_id, created_by, name, description, created_at, status, post_count
FROM topics
WHERE topic_id = $1;

-- name: SearchTopics :many
SELECT topic_id, created_by, name, description, created_at, status, post_count
FROM topics
WHERE
    (name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%')
    AND status = 'active'
ORDER BY created_at DESC;

-- name: IncrementPostCount :exec
UPDATE topics
SET post_count = post_count + 1
WHERE topic_id = $1;

-- name: DecrementPostCount :exec
UPDATE topics
SET post_count = post_count - 1
WHERE topic_id = $1;

-- name: DeleteTopic :one
UPDATE topics
SET status = 'removed',
    removed_at = NOW(),
    removed_by = $2,
    name = name || '_deleted_' || CAST(EXTRACT(EPOCH FROM NOW()) AS TEXT)
WHERE topic_id = $1 AND created_by = $3
RETURNING topic_id;
