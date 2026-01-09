-- +goose Up
CREATE TABLE Topics (
    topic_id BIGSERIAL PRIMARY KEY, -- Automatic increments
    created_by BIGINT NOT NULL REFERENCES users(user_id), -- Just store the actual user_id
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(0) WITH TIME ZONE,
    -- Moderation fields
    status TEXT DEFAULT 'active',
    removed_at TIMESTAMP(0) WITH TIME ZONE,
    removed_by BIGINT REFERENCES users(user_id),
    removal_reason TEXT
);

CREATE INDEX idx_topics_created_at ON topics(created_at DESC); -- Index for faster queries

-- +goose Down
DROP TABLE Topics;