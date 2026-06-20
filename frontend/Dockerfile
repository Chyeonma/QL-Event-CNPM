# Stage 1: Build the React application using Vite
FROM node:20-alpine AS builder
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm install
# Copy the rest of the files including .env so Vite can bake it into the build
COPY . .
RUN npm run build

# Stage 2: Serve the built static files using Nginx
FROM nginx:alpine
# Copy custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx runs on port 80 internally
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
