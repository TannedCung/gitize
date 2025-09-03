FROM rust:1.75

WORKDIR /app

# Install diesel CLI
RUN cargo install diesel_cli --no-default-features --features postgres

# Copy dependency files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

EXPOSE 8000

CMD ["cargo", "run", "--release"]
