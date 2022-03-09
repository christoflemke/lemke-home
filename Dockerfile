FROM node:14-stretch AS node_modules
RUN mkdir /app
WORKDIR /app
ADD package.json .
ADD package-lock.json .
RUN npm ci

FROM node:14-stretch
RUN mkdir -p /app/config
WORKDIR /app
COPY index.js /app
COPY lib /app/lib
COPY config/docker.json /app/config/default.json
COPY --from=node_modules /app/node_modules /app/node_modules
CMD node /app/index.js