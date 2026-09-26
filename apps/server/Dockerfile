# Build the server from the repository root so workspace dependencies are available.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/server/package*.json apps/server/tsconfig.json ./apps/server/
COPY apps/server/src ./apps/server/src
RUN npm install
RUN npm run --workspace @solve-ai/server build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/server/package*.json apps/server/tsconfig.json ./apps/server/
COPY --from=build /app/apps/server/dist ./apps/server/dist
RUN npm install --omit=dev
EXPOSE 4000
CMD ["npm", "run", "--workspace", "@solve-ai/server", "start"]
