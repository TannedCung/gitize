# Multi-stage build for optimized production image
FROM rust:1.78 as builder

WORKDIR /app

# Install diesel CLI for migrations (compatible version)
RUN cargo install diesel_cli --version 2.1.1 --no-default-features --features postgres

# Copy dependency files first for better caching
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this layer will be cached)
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built binary from builder stage
COPY --from=builder /app/target/release/github-trending-summarizer /app/
COPY --from=builder /usr/local/cargo/bin/diesel /usr/local/bin/

# Copy migrations
COPY migrations ./migrations
COPY diesel.toml ./

# Create non-root user for security
RUN useradd -r -s /bin/false appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["./github-trending-summarizer"]
