# Build Stage
FROM node:18-alpine as build

WORKDIR /app

# Install git for versioning
RUN apk add --no-cache git

# Copy .git directory for versioning
COPY .git ./.git

# Copy frontend files
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

# Generate version from git commit count
RUN echo "{\"version\": \"v1.$(git rev-list --count HEAD)\"}" > public/version.json

RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
