# Rhiannon Status

### Route migration

* [ ] Authentication routes
  * [ ] POST /sign-in-token (create token + send sign in/up email)
  * [ ] GET /sign-in (sign-in link from email)
  * [ ] POST /registration (create new account)
  * [ ] POST /sign-out

* [X] Like routes
  * [X] PUT /likes/:songId
  * [X] DELETE /likes/:songId

* [ ] Mixtape routes
  * [X] GET /mixtapes/:id
  * [X] POST /mixtapes
  * [X] DELETE /mixtapes/:id
  * [X] POST /mixtapes/:mixtapeId/songs
  * [ ] DELETE /mixtapes/:mixtapeId/songs/:songId
  * [ ] POST /mixtapes/:mixtapeId/order
  * [ ] POST /mixtapes/:mixtapeId/publish
  * [ ] POST /mixtapes/:mixtapeId/title
  * [ ] GET /draft-mixtapes

* [ ] Notifications routes
  * [ ] GET /notifications
  * [ ] POST /notifications/mark-all-read

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

* [ ] Settings routes
  * [ ] GET /settings/email-subscription
  * [ ] POST /settings/email-subscription
  * [ ] DELETE /settings/email-subscription
  * [ ] POST /settings/color-scheme
  * [ ] POST /settings/go-public
  * [ ] POST /settings/go-private

* [ ] Spotify auth
  * [ ] GET /spotify-connect
  * [ ] GET /spotify-connect/cb
  * [ ] GET /spotify-token
  * [ ] DELETE /spotify-token

* [ ] Twitter auth
  * [ ] GET /twitter-connect
  * [ ] GET /twitter-connect/cb
  * [ ] DELETE /twitter-token

* [ ] Users routes
  * [ ] GET /me
  * [ ] POST /following
  * [ ] DELETE /following/:name
  * [ ] GET /friend-suggestions
  * [ ] GET /users/:name/following
  * [ ] GET /users/:name/followers

### Other major tasks:

* [x] Hook up Sentry for monitoring (can test locally)
* [X] Add Redis client for various caches
* [X] Add Spotify API client
* [x] Add Twitter API client
* [X] Add Apple Music API client
* [ ] Begin using Flyway for production migrations

