FROM node:18-alpine

WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
