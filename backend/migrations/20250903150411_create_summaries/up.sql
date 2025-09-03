CREATE TABLE summaries (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT REFERENCES repositories(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(repository_id)
);
