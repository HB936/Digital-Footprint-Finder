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

# Clone Sherlock repo to get access to the script
RUN git clone https://github.com/sherlock-project/sherlock.git /app/sherlock-repo

# Build phoneinfoga from phoneinfoga subdirectory
RUN cd /app/phoneinfoga && go mod download 2>/dev/null || true && make build || go build -o ./bin/phoneinfoga .

# Node dependencies
RUN npm install --prefix api
RUN npm install --prefix frontend

# Build frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
