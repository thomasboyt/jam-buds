# Jam Buds

[![Build Status](https://travis-ci.org/thomasboyt/jam-buds.svg?branch=master)](https://travis-ci.org/thomasboyt/jam-buds)

Jam Buds is a tiny web application that helps you share music with your friends.

In Jam Buds, a user can paste links to songs that like. These links are then put into a playlist for that user that their friends can access and play through at their leisure.

## TODOs

https://trello.com/b/PjYwkDXf/jam-buds

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

## Testing

Create a `.env.test` file with a test DATABASE_URL (don't worry about the rest of the values in .env; none of them are used at the moment):

```
# .env.test
DATABASE_URL=postgres://tboyt@localhost:5432/jambuds_test
```

Then run `npm test`.

### Feature Tests

```
npm run run-client
npm run features
# or for a specific spec
./node_modules/.bin/wdio --spec features/addingNewSong.spec.ts
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

# Spotify API key and secret, used for Spotify search
heroku config:set SPOTIFY_CLIENT_ID=foo
heroku config:set SPOTIFY_CLIENT_SECRET=bar

# Google API key used for Youtube Data API
# (Youtube Data API must be enabled in Google Developer Console)
heroku config:set GOOGLE_API_KEY=foo

# Set Sentry (sentry.io) app DSN
heroku config:set SENTRY_DSN=https://foo:bar@sentry.io/123
```

You're gonna want a database:

```
heroku addons:create heroku-postgresql:hobby-dev
```

Grab the DATABASE_URL from `heroku config:get DATABASE_URL`, and paste it into your knexfile so you can run migrations:

```
NODE_ENV=production /node_modules/.bin/knex migrate:latest
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

The `songs` table contains songs. These songs are the songs that are searched for via the Spotify API, after the user has pasted a link to a song. These songs are indexed on their Spotify ID, but a song entry can also not have a Spotify ID due to being a manual entry (for when songs don't exist in Spotify's database).

A `playlist_entries` table joins users to songs, forming that user's playlist. Beyond just joining the two tables' IDs, this table is also what actually contains the Youtube/Bandcamp/Soundcloud link a user shares. Think of this as a "shared song" resource. This table also includes the date the user added that song for sorting.

A `users_songs_listened` table is what's used to track whether a specific user has listened to a song. Theoreticlaly, an entry in this row for a user and song means that user has listened to that song. This join could be weird?

A `following` table joins users to who they're following. This list is auto-populated by their Twitter following when they join. I'm not sure how it gets refreshed, yet. Maybe it doesn't and there's a manual "follow" button?

#### Twitter Sync

Twitter sync is expecting to be a somewhat-expensive operation. Therefore, it should be triggered only when the friends list was last synced > X minutes ago, and handled as a "background operation" in the frontend.

What this means is that when a user loads their home page initially, the page is immediately rendered with their current friends list. The frontend should make a query immediately after fetching `/me` to sync. This query (let's say to `/twitter-sync`) should return immediately with a `synced: false` payload if the user was not over the specified sync time.

Otherwise, the query should kick off the syncing process. Ideally, no matter where the user is in the application, the request should remain open in the background as the sync continues. If the user disconnects and the request is not fulfilled, the sync should still successfully finish so that when they later return it will have their up to date information.

In the friends list, to avoid elements from moving out from under user input, _the list should not actually update when the new following list is fetched_.

If the query ends up being faster than expected, it may be possible to change the friends list to not render until the request is made, likely with some maximum timeout. This would happen by having `/me` make the sync request and just return early if there's a timeout. Then, the friends list would not be refreshed until the user makes another query to `/me`.

Pseudo code:

```
if (last sync time was less than X minutes ago) {
  return {
    "synced": false,
  }
}

# retrieve IDs from Twitter endpoint
twitterIds = getFollowingIds()

# short-circuit if nothing changed
existingCount = select count(*) from following where user_id=$currentUserId
if (existingCount === twitterIds.length) {
  return
}

# get list of all Jam Buds user IDs for all Twitter users you following
# (todo: is there a better way to do this lookup? caching in a table per user?)
newIds = select user_id from users where twitter_id in (...$twitterIds)

# get list of currently-following users
oldIds = select following_id from following where user_id=$currentUserId

# get IDs to add and remove from that list
idsToAdd = _.difference(newIds, oldIds)
idsToDelete = _.difference(oldIds, newIds)

# perform diff
within a single transaction (!):
  for id in idsToAdd: insert ($currentUserId, $id) into "following"
  for id in idsToDelete: delete from "following" where id=$id

following = getFollowingForUserId(userId)

return {
  "synced": true,
  "following": [...],
}
```

### Resources

some potentially useful things:

- react audio (youtube) player widget from loudplaces.disco.zone https://github.com/thomasboyt/loudplaces.disco.zone/tree/master/app/components/audio
- how to do a social feed http://stackoverflow.com/questions/1443960/how-to-implement-the-activity-stream-in-a-social-network
