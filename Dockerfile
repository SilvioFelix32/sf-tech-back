FROM node:latest
WORKDIR /usr/app
COPY package.json yarn.lock ./
COPY . .
RUN yarn
RUN yarn build
EXPOSE 3003
CMD ["yarn", "start:prod"]

