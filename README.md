# Jam Buds

[![Build Status](https://travis-ci.org/thomasboyt/jam-buds.svg?branch=master)](https://travis-ci.org/thomasboyt/jam-buds)

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## Overview

Jam Buds is split into two self-contained "apps," intended for separate deployment.

* The *API app* is the API server that powers the backend.
* The *App app* (I know, I know) is the browser app, which is itself two pieces:
    * The Vue browser app
    * A server that renders the Vue app. This is the web app the user actually hits directly (e.g. it's what's located at `jambuds.club`). It also hosts static assets for the client, which should be behind a CDN

These two apps are deployed in isolation, and don't currently share any dependencies. This might change if I get lerna or something set up.

In addition, this repo also contains some development-specific configuration and feature tests that interact with both the browser app and API.

## Install

Base requirements:

* Node: 8.x or higher is probably fine.
* NPM: 5.x or higher is a-ok.
* Postgres: 10.x recommended, but 9.x is probably fine too. Currently runs in 9.6 on CI because of Travis woes anyways.

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

First, copy over `_env` to `.env` and fill it out. You'll need to provision Twitter, Spotify, and Youtube API apps, but they're all pretty easy to set up. The Google one just needs Youtube API access, btw.

Make sure your `.env` has your username replaced for the DB connection, then set up your database:

```
cd api
createdb jambuds
./node_modules/.bin/knex init
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

```
heroku git:remote -a jambuds-app -r heroku-app
heroku git:remote -a jambuds-api -r heroku-api
```

### Configure API

```
# used for CORS
heroku config:set APP_URL=https://myapp.herokuapps.com

# Twitter API key and secret, used for Twitter OAuth.
heroku config:set TWITTER_API_KEY=foo
heroku config:set TWITTER_API_SECRET=bar

# Spotify API key and secret, used for Spotify search
heroku config:set SPOTIFY_CLIENT_ID=foo
heroku config:set SPOTIFY_CLIENT_SECRET=bar

# Google API key used for Youtube Data API
# (Youtube Data API must be enabled in Google Developer Console)
heroku config:set GOOGLE_API_KEY=foo

# Set Sentry (sentry.io) app DSN for the API app
heroku config:set SENTRY_DSN_API=https://foo:bar@sentry.io/123
```

You're gonna want a database:

```
heroku addons:create heroku-postgresql:hobby-dev
```

After deploying for the first time, run migrations:

```
heroku run npx knex migrate:latest --app jambuds-api
```

### Configure App Server

```
heroku config:set NPM_CONFIG_PRODUCTION=true
heroku config:set API_URL=https://myapp-api.herokuapps.com
heroku config:set STATIC_URL=https://xxx.cloudfront.net
heroku config:set SENTRY_DSN_APP=https://foo:bar@sentry.io/123
heroku config:set SENTRY_PUBLIC_DSN_APP=https://foo@sentry.io/123
```

### Configure CDN

TODO

tl;dr - cloudfront in front of $APP_URL/assets, configure to use HTTPS and gzip assets, set STATIC_URL=https://xxx.cloudfront.net on app server

### Deploy

```
./deploy.sh
```
