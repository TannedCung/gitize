CREATE TABLE trending_history (
    id BIGSERIAL PRIMARY KEY,
    repository_id BIGINT REFERENCES repositories(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL,
    forks INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trending_history_repository_id ON trending_history(repository_id);
CREATE INDEX idx_trending_history_recorded_at ON trending_history(recorded_at);
