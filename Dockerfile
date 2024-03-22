FROM node:latest
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build || echo "Build failed, please check your build configuration."
EXPOSE 3003
CMD ["node", "./dist/src/main"]
