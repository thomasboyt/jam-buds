# Jam Buds

[![Build Status](https://travis-ci.org/thomasboyt/jam-buds.svg?branch=master)](https://travis-ci.org/thomasboyt/jam-buds)

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## Install

### API Server

```
cd api
npm install
createdb jambuds
./node_modules/.bin/knex init
npm run resetdb
```

### App Server

```
cd app
npm install
```

## Run in development

First, copy over `_env` to `.env` and fill it out. You'll need to provision Twitter, Spotify, and Youtube API apps, but they're all pretty easy to set up. The Google one just needs Youtube API access, btw.

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
npm run run-client
npm run features
# or for a specific spec
./node_modules/.bin/wdio --spec features/addingNewSong.spec.ts
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

Grab the DATABASE_URL from `heroku config:get DATABASE_URL`, and paste it into your knexfile so you can run migrations:

```
NODE_ENV=production /node_modules/.bin/knex migrate:latest
```

### Configure App Server

```
heroku config:set NPM_CONFIG_PRODUCTION=true
heroku config:set SKIP_DOTENV=true
heroku config:set API_URL=https://myapp-api.herokuapps.com
heroku config:set STATIC_URL=https://myapp.surge.sh
heroku config:set SENTRY_DSN_APP=https://foo:bar@sentry.io/123
```

### Configure Static Files

Copy `_env.production` to `.env.production`. The variables in this file are used _when building_ your Webpack client bundle locally.

#### Configure Firebase

Install Firebase's CLI tools if you don't have it:

```
npm install -g firebase-tools
```

Create a new Firebase hosting project. Then add a `.firebaserc`:

```
{
  "projects": {
    "default": "firebase-project-id"
  }
}
```

### Deploy

```
./deploy.sh
```