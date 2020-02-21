FROM node:12-alpine

# XXX: This Dockerfile assumes you've already built outside the container! This
# is basically just to save time on CI builds by using the cached node_modules/
# from the current build which is, admittedly, super questionable.

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Add the rest of the app
COPY --chown=node:node . .
USER node

# Create static folder that can be served from e.g. Caddy
RUN mkdir -p public
RUN cp -r .nuxt/dist/client/. src/static/. public

EXPOSE 8080
CMD [ "./node_modules/.bin/nuxt", "start" ]