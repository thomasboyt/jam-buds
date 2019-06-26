# Jam Buds

[![Build Status](https://travis-ci.org/thomasboyt/jam-buds.svg?branch=master)](https://travis-ci.org/thomasboyt/jam-buds)

Jam Buds is a lil web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## Overview

Jam Buds is split into two self-contained "apps," intended for separate deployment.

* The *API app* is the API server that powers the backend.
* The *App app* (I know, I know) is the frontend app, which is itself two pieces:
    * The Vue browser app
    * A server that renders the Vue app. This is the web app the user actually hits directly (e.g. it's what's located at `jambuds.club`). It also hosts static assets for the client, which should be behind a CDN

These two apps currently don't currently share any dependencies. This might change if I get lerna or something set up.

In addition, this repo also contains some development-specific configuration and feature tests that interact with both the browser app and API.

## Install

Base requirements:

* Node: 8.x or higher is probably fine.
* NPM: 5.x or higher is a-ok.
* Postgres: 10.x recommended, but 9.x is probably fine too. Currently runs in 9.6 on CI because of Travis woes anyways.
* Redis: 5.x recommended

Everything else is handled by NPM. Make sure your editor is configured to prefer local versions of dev depdendencies (TypeScript, ESLint, Prettier...).

### API Server

```
cd api
npm install
```

### App Server

```
cd app
npm install
```

## Run in development

First, copy over `_env` to `.env` and fill it out. There's lots of API key provisioning and stuff to do there.

Make sure your `.env` has your username replaced for the DB connection, then set up your database:

```
cd api
npm run resetdb
```

To start the app, in two separate sessions, run:

```
cd api && npm run dev
cd app && npm run dev
```

## Testing

Create a `.env.test` file with a test DATABASE_URL (don't worry about the rest of the values in .env; none of them are used at the moment):

```
# .env.test
DATABASE_URL=postgres://tboyt@localhost:5432/jambuds_test
```

Then run `cd api && npm test`.

### Feature Tests

```
# in one session:
cd app && NODE_ENV=test PORT=8080 npm run dev

# in another:
cd spec && npm test
```

## Deploy

This repo contains two separate apps: the API server and the app (rendering) server & Vue client.

There's a few ways to handle deploying them.

### Docker

Both apps have their own Dockerfiles, and can be run on a Docker host together.

When building for Docker, the Webpack builds are done totally locally before being copied into the Docker images, meaning certain production environment variables need to be set for the build. See the `_env.deploy` template for these variables, as well as variables used for SSH-based deploys.

### Heroku

You can deploy Jam Buds to Heroku, where you could run it as two separate apps using the included Procfiles. You do need a little magic to deploy two apps from one repo:

```
heroku git:remote -a jambuds-app -r heroku-app
heroku git:remote -a jambuds-api -r heroku-api
```

You'll want to use `heroku:config` to set everything listed in the production requirements. Note that App and API have different requirements, but it's probably easiest to just keep all the config in sync between them, just in case.

You're gonna want a database:

```
heroku addons:create heroku-postgresql:hobby-dev
```

After deploying for the first time, run migrations:

```
heroku run npx knex migrate:latest --app jambuds-api
```

### Configure CDN

Jam Buds can utilize a CDN by changing the `STATIC_URL` path on the app server (as well as in Webpack builds). You can put `https://$APP_URL/assets` behind a CDN like Cloudfront, and then set `STATIC_URL` to be your Cloudfront host.

### Provisioning External Services

These services are required for running Jam Buds in production, as well as for running feature tests. Some are kind of tricky to set up. Pay close attention to the environment configuration.

#### Spotify

Create a Spotify app through Spotify's dev dashboard. Set the callback URL to:

```
http{s}://{YOUR_HOST}/auth/spotify-connect/cb
```

Runtime environment variables for Spotify:

```
# Spotify API key and secret
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

There is no additional build time configuration necessary.

#### Twitter

Create a Twitter app through Twitter's dev dashboard. Set the callback URL to:

```
http{s}://{YOUR_HOST}/auth/twitter-connect/cb
```

Runtime environment variables for Twitter:

```
TWITTER_API_KEY=
TWITTER_API_SECRET=
```

There is no additional build time configuration necessary.

#### Apple Music

This one completely sucks, not gonna lie. It also costs, like, $100, so if you're just trying to make a PR or something, you shouldn't need to do this. I'm working on making it easy to disable the Apple Music systems in development.

You'll need to [create a MusicKit identifier](https://help.apple.com/developer-account/#/devce5522674), then generate and download a private key from the developer dashboard. Put this somewhere (I've `gitignored` the `secrets` folder for this).

Update both `.env` and `.env.deploy` or whatever **build-time** configuration you have, as the Apple Music token is both an *API runtime* dependency (for track search) and an *App build-time* dependency (for the MusicKit JS player):

```
# Used for provisioning Apple Music. This path is used for the Webpack builds,
which generate a JWT key at build time, in addition to the API, which uses it for search.
MUSICKIT_PRIVATE_KEY_PATH=/path/to/secrets/your_key.p8
MUSICKIT_TEAM_ID=
MUSICKIT_KEY_ID=
```

If you're using the Docker scripts for prod, the private key on your host should be in `/path/to/jambuds/secrets/jam_buds_prod_key.p8`.