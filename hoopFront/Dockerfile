# Stage 1: Build the frontend
FROM node:20-alpine AS build
WORKDIR /app
# Copy package files
COPY package.json package-lock.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application
COPY . .
# Build the application
RUN npm run build

# Stage 2: Serve the frontend
FROM nginx:alpine
# Copy the built assets to nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
