# Jam Buds

[![Run tests](https://github.com/thomasboyt/jam-buds/workflows/Run%20Tests/badge.svg)](https://github.com/thomasboyt/jam-buds/actions?query=workflow%3A%22Run+Tests%22) [![Deploy to jambuds.club](https://github.com/thomasboyt/jambuds-ops/workflows/Deploy%20to%20jambuds.club/badge.svg?event=workflow_dispatch)](https://github.com/thomasboyt/jambuds-ops/actions?query=workflow%3A%22Deploy+to+jambuds.club%22)

## Overview

Jam Buds is split into two services:

* The *App service* is the frontend app powered by [Nuxt.js](https://nuxtjs.org/). The app is initially server-side rendered before being used as a SPA once laded.
* *Rhiannon* is a the backend server for Jam Buds. It has a codename because it replaced the more generically-named "API server," written in Node.

In addition, this repo also contains some development-specific configuration and feature tests that interact with both the browser app and APIs.

## Install

In development, the services run on your local computer, while databases run via Docker containers.

You'll want the following for the frontend:

- Node: 12.x
- NPM: 6.x

For Rhiannon, you're going to want [IntelliJ IDEA CE](https://www.jetbrains.com/idea/). If you import the `rhiannon/` folder into IntelliJ, it should help you configure the right JVM and Gradle and such.

### Installing Node dependencies

You'll need various NPM depdencies:

```
npm install
cd ../app
npm install
cd ../spec
npm install
```

## Run in development

### Databases

Easiest way to run DBs is through the docker-compose file in the root directory:

```
docker-compose up -d
```

The default app config for development and tests is preconfigured to point to the Postgres and Redis Docker images.

### Configuration

Dev configuration lives in two places:

* For the app service, a `.env` file with local environment variables
* For Rhiannon, `src/main/resources/conf/local/<env>.conf` override files

This is kind of confusing, and there's a bit of overlap, and I may replace Rhiannon's config system with something dotenv-inspired.

#### App config

`app/.env.defaults` shows the different environment variables you can set, mostly self-documenting. Copy properties you want to override to `app/.env`.

#### Rhiannon config

Rhiannon's config for each environment is located in `src/main/resources/conf/<env>.conf`, and can be overridden per environment in `src/main/resources/conf/local/<env>.conf`.

You'll need, at minimum, to add Spotify credentials for local development. In _both_ `local/development.conf` and `local/feature.conf`:

```
rhiannon {
    spotifyClientId = "FOO"
    spotifyClientSecret = "BAR"
}
```

### Dev data & migrations

To set up the DB with dev data:

```
./bin/resetdb.sh
```

Further migrations are handled through Flyway. Run like so:

```
./gradlew flywayMigrate
```

### Launching

In your terminal:

```
cd app
npm run dev
```

In IntelliJ, run the `club.jambuds.ApplicationKt` target that should be preconfigured.

You should be able to visit [localhost:8080](http://localhost:8080) and see the application running successfully.

## Testing

### Unit Tests

Running unit tests for Rhiannon is easy out of the box with normal IntellIJ/JUnit tools.

### Feature Tests

Feature tests use [Cypress](https://www.cypress.io/). Because Cypress runs as a separate process disconnected from the backend, a shell script is used to reset data between runs. To use this locally, you'll need to grab Postgres and Redis clients:

```
brew install postgresql@11
brew install redis
```

To run feature tests locally, you need to spin up all services:

```
cd app && npm run e2e
cd rhiannon && JAMBUDS_ENV=feature ./gradlew run
```

Once they're started:

```
cd spec && npm test
```

Feature tests use the default test DB (`jambuds_test`). To avoid lengthy flyway migration times, feature tests clean and run the migrations once, then use a saved copy of the test schema (in `tmp/schema.sql`). `npm test` will automatically regenerate this schema, but if you are running Cypress tests through any other mechanism, note that if you change the DB schema, you'll need to run `npm run setupDb` to see the changes.

## Deploy

**Todo: Update for Rhiannon**

The recommended way to deploy the Jam Buds is with Docker. All services have their own Dockerfiles, and can be run on a Docker host together.

When building for Docker, the Webpack builds are done totally locally before being copied into the Docker images, meaning certain production environment variables need to be set for the build. See the `.env.build` template for these variables.

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