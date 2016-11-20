# Jam Buds

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## TODOs

- [x] Create frontend app scaffolding (~~Redux~~ Mobx, React-Router, etc)
- [x] Implement login wall & current user endpoint
- [ ] Implement post song/search results
- [ ] Implement playlist
- [ ] Implement friends list
- [ ] Implement audio player

## Install

```
npm install
createdb jambuds
./node_modules/.bin/knex init
npm run resetdb
```

To start the app, in two separate sessions, run:

```
npm run run-client
npm run run-server
```

## Deploy

### Backend (Heroku)

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

### Frontend (Firebase Hosting)

*Note: you can host this with just about anything, as long as you upload the `build/` folder output by `npm run build` somewhere!*

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

Then run `npm run deploy` to build and deploy to Firebase.

## Architecture

Jam Buds uses a relational database to store songs a user has uploaded. Songs are stored per-user but ideally will be normalized just to make any future features easier (like a thing that says "two of your friends also added this song").

Users are authenticated through Twitter, so that it can both link their friends who are Jam Buds and to offload the trouble of storing usernames + passwords.

Your shared songs list is public, so even without authenticating, other users can see it. This way users who do not want to authenticate through Twitter can still use the service as a read-only thing.

### Frontend

Jam Buds's frontend is a simple React and Mobx app.

### API

Jam Buds's API should be a simple REST-ish JSON thing. It would be nice to make it possible to make an iPhone app down the line, so it'll be access token-based instead of cookie-based.

* `POST /users` - Create or log in as a user with a Twitter auth token (this is gonna be some kinda OAuth callback-y thing)
* `GET /users/me` - Get current user. Hit when you first load the app to make sure you're logged in and get basic info.
* `POST /users/me/songs` - Post a new song to your list.
* `GET /users/:id/songs` - Get a user's playlist.
* `DELETE /users/me/songs/:id` - Change your mind on a song.
* `GET /users/friends` - Get your Twitter friends who are on Jam Buds.

### Design

Jam Buds is designed as a two-pane single-screen app. In a left-hand column, you can select a friend's playlist, or post a new song to your own. In the right hand-column, the current playlist is displayed. In a v2 I want to display a feed of all songs you haven't heard on the right-hand side.

At the top of the left-hand column will be the audio player itself. Not sure how that's gonna work with non-Youtube sources yet.

The playlist is presented as a time-descending list of songs. By default, the playlist grays out songs that you have already listened to. A "skip played" option, enabled by default, should be displayed somewhere.

### Schema

The `users` table contains users.

The `songs` table contains songs. These are normalized from various input sources, ideally, so they should have unique-enforced columns for youtube link, spotify link, etc.

A `users_songs` table joins users to songs, forming that user's playlist. This table should also include the date the user added that song for sorting.

A `users_songs_listened` table is what's used to track whether a specific user has listened to a song. Theoreticlaly, an entry in this row for a user and song means that user has listened to that song. This join could be weird?

It might be good to come up with some seed data to make it easy to experiment with this schema and test queries.

### Resources

some potentially useful things:

- react audio (youtube) player widget from loudplaces.disco.zone https://github.com/thomasboyt/loudplaces.disco.zone/tree/master/app/components/audio
- how to do a social feed http://stackoverflow.com/questions/1443960/how-to-implement-the-activity-stream-in-a-social-network
