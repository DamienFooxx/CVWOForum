-- name: CreateComment :one
INSERT INTO comments (post_id, commented_by, parent_id, body)
VALUES ($1, $2, $3, $4)
RETURNING comment_id, post_id, commented_by, parent_id, body, created_at, status;

-- name: ListCommentsByPost :many
SELECT comment_id, post_id, commented_by, parent_id, body, created_at, edited_at, status
FROM comments
WHERE post_id = $1
ORDER BY created_at ASC;

-- name: GetComment :one
SELECT comment_id, post_id, commented_by, parent_id, body, created_at, edited_at, status
FROM comments
WHERE comment_id = $1;

-- name: UpdateComment :one
UPDATE comments
SET body = $2, edited_at = NOW()
WHERE comment_id = $1 AND commented_by = $3
    RETURNING comment_id, body, edited_at;