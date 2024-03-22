FROM node:latest
WORKDIR /usr/app
COPY package.json yarn.lock ./
COPY . .
RUN yarn
RUN yarn build || echo "Build failed, please check your build configuration."
EXPOSE 3003
CMD ["yarn", "start:prod"] || echo "Yarn start:prod failed, please check your build configuration."
