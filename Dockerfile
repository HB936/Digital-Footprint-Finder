FROM node:22

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files (except submodules)
COPY . .

# Clone and install Sherlock from GitHub
RUN git clone https://github.com/sherlock-project/sherlock.git /app/sherlock-repo && \
    cd /app/sherlock-repo && \
    pip3 install --no-cache-dir -r requirements.txt

# Node dependencies
RUN npm install --prefix api
RUN npm install --prefix frontend

# Build frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
