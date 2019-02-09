This folder contains fies related to the build and deploy process. Maybe they'll be replaced by something more magic.

### build.sh

Build Docker images locally, including the Webpack builds for the App server.

### upload-images.sh

Deploy Docker images to a remote host using a strategy I got from Stack Overflow. Kind of inefficient! Requires the `pv` utility (`brew install pv`).

### run-docker.sh

Restarts docker containers on the remote host.

### deploy.sh

Runs all of the above.

## .env.deploy

TODO: move this into main readme

```sh
# Config used purely for production static builds.
# You don't need this if you're doing builds on a server,
# as e.g. part of a Heroku buildpack.

NODE_ENV=production
STATIC_URL=
SENTRY_PUBLIC_DSN_APP=

# Deploy stuff
JAMBUDS_SSH_REMOTE=me@host.name
JAMBUDS_REMOTE_PATH=/home/me/jam-buds
```