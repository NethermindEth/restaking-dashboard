FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm i --production

FROM node:20-alpine

EXPOSE 80 443 3000

WORKDIR /app

# ENV ADDRESS=0.0.0.0
# ENV PORT=3000

COPY . .

COPY --from=build /app/node_modules ./node_modules

ENTRYPOINT ["node", "index.js"]
