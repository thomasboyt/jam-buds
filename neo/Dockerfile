FROM node:12-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Add the rest of the app
COPY --chown=node:node . .
USER node

# Build the app
RUN npm run build-prod -b

EXPOSE 3001
CMD [ "npm", "start" ]