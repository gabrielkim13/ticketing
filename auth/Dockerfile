FROM node:alpine

ENV CI=true

WORKDIR /app

COPY package.json .

RUN yarn install --prod

COPY . .

CMD ["yarn", "start"]
