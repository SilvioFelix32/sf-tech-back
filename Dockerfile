FROM node:latest
WORKDIR /usr/src
COPY . .
RUN yarn
RUN yarn build
EXPOSE 3001
CMD [ "yarn", "start:prod" ]