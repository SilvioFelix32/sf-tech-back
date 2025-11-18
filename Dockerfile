# Remember to change this if you change the node version in package.json
FROM node:22

EXPOSE 3003

WORKDIR /usr/src

COPY "package.json" "yarn.lock" ./
RUN yarn cache clean --force
COPY . .

RUN yarn
RUN yarn build || echo "DOCKERFILE - Yarn Build failed, please check your build configuration."

CMD ["node", "dist/main.js"]