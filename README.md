# Jam Buds

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

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

TODO.

## Architecture

Jam Buds uses a relational database to store songs a user has uploaded. Songs are stored per-user but ideally will be normalized just to make any future features easier (like a thing that says "two of your friends also added this song").

Users are authenticated through Twitter, so that it can both link their friends who are Jam Buds and to offload the trouble of storing usernames + passwords.

Your shared songs list is public, so even without authenticating, other users can see it. This way users who do not want to authenticate through Twitter can still use the service as a read-only thing.

### Frontend

Jam Buds's frontend will likely be a simple React and Redux app.

### API

Jam Buds's API should be a simple REST-ish JSON thing. It would be nice to make it possible to make an iPhone app down the line, so it'll be access token-based instead of cookie-based.

* `POST /users` - Create or log in as a user with a Twitter auth token (this is gonna be some kinda OAuth callback-y thing)
* `POST /users/me/songs` - Post a new song to your list
* `DELETE /users/me/songs/:id` - Change your mind on a song
* `GET /users/:id/songs` - Get a user's playlist