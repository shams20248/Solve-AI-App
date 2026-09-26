FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web ./apps/web
COPY apps/web/package*.json ./apps/web/

RUN npm install
RUN npm --workspace apps/web install
RUN npm --workspace apps/web run build

EXPOSE 5173

CMD ["npm", "--workspace", "apps/web", "run", "preview"]
