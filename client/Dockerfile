FROM node:alpine

ENV CI=true

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

CMD ["yarn", "dev"]
