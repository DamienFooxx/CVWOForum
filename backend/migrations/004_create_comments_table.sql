-- +goose Up
CREATE TABLE comments (
    comment_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    commented_by BIGINT NOT NULL REFERENCES users(user_id),
    parent_id BIGINT REFERENCES comments(comment_id) ON DELETE CASCADE, -- Nullable, for replies
    body TEXT NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMP(0) WITH TIME ZONE,

    -- Moderation fields
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'removed', 'flagged')),
    removed_at TIMESTAMP(0) WITH TIME ZONE,
    removed_by BIGINT REFERENCES users(user_id),
    removal_reason TEXT
);

-- Index for fetching comments of a post (usually ordered by time)
CREATE INDEX idx_comments_post_created_at ON comments(post_id, created_at);

-- +goose Down
DROP TABLE comments;