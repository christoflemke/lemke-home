ARG image=node:18-bullseye

FROM $image AS node_modules
RUN mkdir /app
WORKDIR /app
COPY package*.json /app/
RUN npm ci --only=production

FROM $image
RUN mkdir -p /app/config
WORKDIR /app
COPY --from=node_modules /app/node_modules /app/node_modules
COPY index.js /app
COPY lib /app/lib
CMD node /app/index.js