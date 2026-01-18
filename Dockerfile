# Stage 1: Build phoneinfoga
FROM node:22 AS builder

# Install Go, Git, and build tools
RUN apt-get update && apt-get install -y \
    golang-go \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/go/bin:${PATH}"

# Clone and build phoneinfoga
WORKDIR /app
RUN git clone https://github.com/sundowndev/phoneinfoga.git .
WORKDIR /app/web/client
RUN npm install --legacy-peer-deps
RUN npm run build
WORKDIR /app
RUN go mod download && \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    make build

# Stage 2: Final image
FROM node:22

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files (respecting .dockerignore)
COPY . .

# Install Sherlock
RUN pip3 install --no-cache-dir --break-system-packages sherlock-project

# Create directory for phoneinfoga binary
RUN mkdir -p /app/phoneinfoga/bin

# Copy built phoneinfoga binary from builder stage
COPY --from=builder /app/bin/phoneinfoga /app/phoneinfoga/bin/phoneinfoga

# Node dependencies for user's application
RUN npm install --prefix api
RUN npm install --prefix frontend

# Build user's frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]