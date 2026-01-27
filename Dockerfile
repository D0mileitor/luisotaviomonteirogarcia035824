FROM node:18-alpine AS builder
WORKDIR /app

# instalar dependências
COPY package*.json ./
RUN npm ci --silent

# buildar
COPY . .
RUN npm run build

FROM nginx:stable-alpine
	# Ensure curl is available for healthchecks
	RUN apk add --no-cache curl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
