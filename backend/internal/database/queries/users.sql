-- name: CreateUser :one
INSERT INTO users (username, password_hash, bio)
VALUES ($1, $2, $3)
RETURNING user_id, username, bio, created_at;

-- name: GetUserByUsername :one
SELECT user_id, username, password_hash, bio, created_at
FROM users
WHERE username = $1;

-- name: ListUsers :many
SELECT user_id, username, bio, created_at
FROM users
ORDER BY created_at DESC;