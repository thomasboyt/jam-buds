# Rhiannon Status

### Route migration

* [ ] Authentication routes
  * [ ] POST /sign-in-token (create token + send sign in/up email)
  * [ ] GET /sign-in (sign-in link from email)
  * [ ] POST /registration (create new account)
  * [ ] POST /sign-out

* [ ] Settings routes
  * [ ] GET /settings/email-subscription
  * [ ] POST /settings/email-subscription
  * [ ] DELETE /settings/email-subscription
  * [ ] POST /settings/color-scheme
  * [ ] POST /settings/go-public
  * [ ] POST /settings/go-private

* [ ] Twitter auth
  * [ ] GET /twitter-connect
  * [ ] GET /twitter-connect/cb
  * [ ] DELETE /twitter-token

* [X] Like routes
  * [X] PUT /likes/:songId
  * [X] DELETE /likes/:songId

* [x] Mixtape routes
  * [X] GET /mixtapes/:id
  * [X] POST /mixtapes
  * [X] DELETE /mixtapes/:id
  * [X] POST /mixtapes/:mixtapeId/songs
  * [X] DELETE /mixtapes/:mixtapeId/songs/:songId
  * [X] POST /mixtapes/:mixtapeId/order
  * [X] POST /mixtapes/:mixtapeId/publish
  * [X] POST /mixtapes/:mixtapeId/title
  * [x] GET /draft-mixtapes

* [X] Notifications routes
  * [X] GET /notifications
  * [X] POST /notifications/mark-all-read

* [x] Playlist routes
  * [X] GET /public-feed
  * [X] GET /feed
  * [X] GET /playlists/:user
  * [X] GET /playlists/:user/liked

* [x] Post routes
  * [X] POST /posts
  * [x] DELETE /posts/:songId

* [x] Search routes
  * [X] GET /spotify-search
  * [X] GET /spotify-details/:spotifyId

* [x] Spotify auth
  * [x] GET /spotify-connect
  * [x] GET /spotify-connect/cb
  * [x] GET /spotify-token
  * [x] DELETE /spotify-token

* [ ] Users routes
  * [x] GET /me
  * [X] POST /following
  * [X] DELETE /following/:name
  * [x] GET /friend-suggestions
  * [x] GET /users/:name/following
  * [x] GET /users/:name/followers

### Other major tasks:

* [x] Hook up Sentry for monitoring (can test locally)
* [X] Add Redis client for various caches
* [X] Add Spotify API client
* [x] Add Twitter API client
* [X] Add Apple Music API client
* [X] Begin using Flyway for production migrations
* [X] Port over dev & integration test seeds from API
* [X] Use Flyway + new seeds to reset integration test DB
