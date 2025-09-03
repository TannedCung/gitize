CREATE TABLE repositories (
    id BIGSERIAL PRIMARY KEY,
    github_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    stars INTEGER NOT NULL DEFAULT 0,
    forks INTEGER NOT NULL DEFAULT 0,
    language VARCHAR(100),
    author VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    trending_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repositories_trending_date ON repositories(trending_date);
CREATE INDEX idx_repositories_language ON repositories(language);
CREATE INDEX idx_repositories_stars ON repositories(stars);
