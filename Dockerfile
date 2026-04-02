# Stage 1: Build Frontend (React)
FROM node:20-alpine AS frontend-builder
WORKDIR /build-frontend
# COPY hoopFront code
COPY hoopFront/package*.json ./
RUN npm install
COPY hoopFront/ .
RUN npm run build

# Stage 2: Build Backend (Java Spring Boot)
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /build-backend
COPY hoopBack/pom.xml .
COPY hoopBack/src ./src
# Copy built frontend from Stage 1 into Spring Boot resources/static
COPY --from=frontend-builder /build-frontend/dist ./src/main/resources/static/
# Build the JAR
RUN mvn clean package -DskipTests

# Stage 3: Runner
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /build-backend/target/*.jar app.jar

# Use -Xmx to stay within Render's 512MB limit
ENTRYPOINT ["java", "-Xmx384m", "-Xss512k", "-Duser.timezone=UTC", "-jar", "app.jar"]
