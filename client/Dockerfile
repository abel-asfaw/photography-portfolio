FROM node:24-alpine

WORKDIR /usr/app

# No git checkout in the image, so skip lefthook's hook installation.
ENV LEFTHOOK=0

COPY package*.json ./
RUN npm ci
COPY ./ ./

# This CMD is for development only!
CMD [ "npm", "run", "dev", "--", "--host" ]
