FROM node:latest
WORKDIR /usr/app
COPY package.json yarn.lock ./
COPY . .
ENV JWT_SECRET='af3fe660-686f-4e5e-9f95-89f6caac0fd7'
ENV EXTERNAL_REDIS='rediss://red-cihe8v5gkuvojje31ta0:WOtZOQ7YJFBF0oTKmrBRo2SVXnGqwrVn@oregon-redis.render.com:6379'
ENV DATABASE_URL='mongodb+srv://sf-tech:ThtoTtV6iA0INT2h@sf-tech.k6lsm.mongodb.net/sf-tech'
RUN yarn
RUN yarn build
EXPOSE 3003
CMD ["yarn", "start:prod"]

