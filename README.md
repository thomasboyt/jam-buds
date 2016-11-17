# Jam Buds

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## TODOs

- [ ] Create frontend app scaffolding (Redux, React-Router, etc)
- [ ] Implement login wall & current user endpoint
- [ ] Implement post song page
- [ ] Implement song list page
- [ ] Implement friends list page

## Install

```
npm install
createdb jambuds
./node_modules/.bin/knex init
```

Replace the databases in `knexfile.js` and `.env` with the correct development locations. Then run:

```
./node_modules/.bin/knex migrate:latest
```

To start the app, in two separate sessions, run:

```
npm run run-client
npm run run-server
```

## Deploy

Create a Heroku app and create configuration:

```
# you want to set this to make sure things like sentry, etc. are enabled
heroku config:set NODE_ENV=production

# obviously replace these with wherever you deploy the backend & frontend
heroku config:set SERVER_URL=https://myapp.herokuapps.com
heroku config:set STATIC_URL=https://myapp.surge.sh

# Twitter API key and secret, used for Twitter OAuth.
heroku config:set TWITTER_API_KEY=foo
heroku config:set TWITTER_API_SECRET=bar
```

You're gonna want a database:

```
heroku addons:create heroku-postgresql:hobby-dev
```

Grab the DATABASE_URL from `heroku config:get DATABASE_URL`, and paste it into your knexfile so you can run migrations:

```
/node_modules/.bin/knex migrate:latest --env production
```

## Architecture

Jam Buds uses a relational database to store songs a user has uploaded. Songs are stored per-user but ideally will be normalized just to make any future features easier (like a thing that says "two of your friends also added this song").

Users are authenticated through Twitter, so that it can both link their friends who are Jam Buds and to offload the trouble of storing usernames + passwords.

Your shared songs list is public, so even without authenticating, other users can see it. This way users who do not want to authenticate through Twitter can still use the service as a read-only thing.

### Frontend

Jam Buds's frontend will likely be a simple React and Redux app.

### API

Jam Buds's API should be a simple REST-ish JSON thing. It would be nice to make it possible to make an iPhone app down the line, so it'll be access token-based instead of cookie-based.

* `POST /users` - Create or log in as a user with a Twitter auth token (this is gonna be some kinda OAuth callback-y thing)
* `GET /users/me` - Get current user. Hit when you first load the app to make sure you're logged in and get basic info.
* `POST /users/me/songs` - Post a new song to your list.
* `GET /users/:id/songs` - Get a user's playlist.
* `DELETE /users/me/songs/:id` - Change your mind on a song.
* `GET /users/friends` - Get your Twitter friends who are on Jam Buds.