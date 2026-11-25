# ---------- Etapa 1: compilar con Vite ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Etapa 2: Nginx sin root (compatible con OpenShift), puerto 8080 ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine
# Servicio del backend dentro de OpenShift
ENV BACKEND_HOST=backend
ENV BACKEND_PORT=8080
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
