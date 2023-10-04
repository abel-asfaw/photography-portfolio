FROM node:20-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm install
COPY ./ ./

# This CMD is for development only!
CMD [ "npm", "run", "dev" ]
