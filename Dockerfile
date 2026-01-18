FROM node:22

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY . .

# Node dependencies
RUN npm install --prefix api
RUN npm install --prefix frontend

# Build frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
