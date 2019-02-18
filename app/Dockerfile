FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Add the rest of the app
COPY --chown=node:node . .
USER node

EXPOSE 8080
CMD [ "npm", "start" ]