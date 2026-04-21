FROM node:18-alpine

WORKDIR /app

# Copy the full app so we can build the frontend and serve it from Express
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN cd frontend && npm install
RUN cd backend && npm install

COPY . .
RUN cd frontend && npm run build

# Expose app port
EXPOSE 5000

# Start the backend, which also serves the built frontend
CMD ["npm", "start"]
