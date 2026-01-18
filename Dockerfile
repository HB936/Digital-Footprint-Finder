FROM node:22

# Install Python, Go, and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    golang-go \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files (except submodules)
COPY . .

# Install Sherlock from PyPI
RUN pip3 install --no-cache-dir --break-system-packages sherlock-project

ENV PATH="/root/go/bin:${PATH}"

# Clone and build phoneinfoga from GitHub
RUN git clone https://github.com/sundowndev/phoneinfoga.git /app/phoneinfoga-src
WORKDIR /app/phoneinfoga-src/web/client
RUN npm install
RUN npm run build
WORKDIR /app/phoneinfoga-src
RUN go mod download && \
    go install github.com/swaggo/swag/cmd/swag@latest && \
    make build && \
    mkdir -p /app/phoneinfoga/bin && \
    cp ./bin/phoneinfoga /app/phoneinfoga/bin/phoneinfoga
WORKDIR /app

# Node dependencies
RUN npm install --prefix api
RUN npm install --prefix frontend

# Build frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
