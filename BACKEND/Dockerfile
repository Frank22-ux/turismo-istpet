# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiamos package.json primero
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto
EXPOSE 4000

# Comando para desarrollo
CMD ["npm", "run", "dev"]