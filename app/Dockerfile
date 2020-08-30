FROM node:12-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Add the rest of the app
COPY --chown=node:node . .
USER node

# Build app
RUN NODE_ENV=production npm run build -- --quiet

# Create static folder that can be served from e.g. Caddy
RUN mkdir -p public
RUN cp -r .nuxt/dist/client/. src/static/. public

EXPOSE 8080
CMD [ "./node_modules/.bin/nuxt", "start" ]