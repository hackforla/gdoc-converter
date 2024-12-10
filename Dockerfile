FROM node:23-alpine
# RUN mkdir -p /node/node_modules && chown -R node:node /node

# add bash
RUN apk add bash

# Create app directory
WORKDIR /node

RUN echo ****************************
COPY ./utils/package*.json ./
COPY ./utils ./
RUN npm install
CMD ["npm", "gdocs2md/scripts/start-express.js"]

EXPOSE 3000