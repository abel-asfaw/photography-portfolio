FROM node:20-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci
COPY ./ ./

# This CMD is for development only!
CMD [ "npm", "run", "dev" ]
