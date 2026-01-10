# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Inject version info before build
ARG GIT_COMMIT=unknown
ARG BUILD_TIME=unknown
RUN echo "{\"commit\":\"${GIT_COMMIT}\",\"buildTime\":\"${BUILD_TIME}\"}" > public/version.json

RUN npm run build

# Production Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
