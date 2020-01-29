FROM node:12-alpine

# Required for restea git dependency
RUN apk add --no-cache git

# Install dependencies
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install

# Add the rest of the app
COPY --chown=node:node . .

# Build the app
RUN npm run build-prod -b

EXPOSE 3001
CMD [ "npm", "start" ]