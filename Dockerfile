FROM node:lts AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

FROM node:lts-slim

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

RUN npm prune --production && \
    rm -rf /usr/local/share/.cache /root/.npm /tmp/

CMD [ "node", "app.js" ]

