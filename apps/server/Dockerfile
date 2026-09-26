FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/server ./apps/server
COPY apps/server/package*.json ./apps/server/

RUN npm install
RUN npm --workspace apps/server install
RUN npm --workspace apps/server run build

EXPOSE 4000

CMD ["npm", "--workspace", "apps/server", "run", "start"]
