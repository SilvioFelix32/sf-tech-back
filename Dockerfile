FROM node:latest
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build
EXPOSE 3003
CMD ["node", "./dist/src/main"]  # Alteração no comando CMD para executar o arquivo gerado corretamente

