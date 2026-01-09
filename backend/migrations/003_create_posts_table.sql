-- +goose Up
CREATE TABLE Posts (
    post_id BIGSERIAL PRIMARY KEY, -- Automatic increments
    topic_id BIGINT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
    created_by BIGINT NOT NULL REFERENCES users(user_id), -- Just store the actual user_id
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) WITH TIME ZONE,
    -- Moderation fields
    status TEXT DEFAULT 'active',
    removed_at TIMESTAMP(0) WITH TIME ZONE,
    removed_by BIGINT REFERENCES users(user_id),
    removal_reason TEXT
);

CREATE INDEX idx_posts_topic_created_at ON posts(topic_id, created_at DESC); -- Index for faster reads

-- +goose Down
DROP TABLE Posts;