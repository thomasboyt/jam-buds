# Rhiannon Status

Next on deck: Song search & post flows

### Route migration

* [ ] Authentication routes
  * [ ] POST /sign-in-token (create token + send sign in/up email)
  * [ ] GET /sign-in (sign-in link from email)
  * [ ] POST /registration (create new account)
  * [ ] POST /sign-out
  k
* [ ] Like routes
  * [ ] PUT /likes/:songId
  * [ ] DELETE /likes/:songId

* [ ] Mixtape routes
  * [X] GET /mixtapes/:id
  * [X] POST /mixtapes
  * [ ] POST /mixtapes/:mixtapeId/songs
  * [ ] DELETE /mixtapes/:mixtapeId/songs/:songId
  * [ ] POST /mixtapes/:mixtapeId/order
  * [ ] POST /mixtapes/:mixtapeId/publish
  * [ ] POST /mixtapes/:mixtapeId/title
  * [ ] GET /draft-mixtapes

* [ ] Notifications routes
  * [ ] GET /notifications
  * [ ] POST /notifications/mark-all-read

* Playlist routes
  * [X] GET /public-feed
  * [X] GET /feed
  * [X] GET /playlists/:user
  * [X] GET /playlists/:user/liked

* [ ] Post routes
  * [ ] POST /posts
  * [ ] DELETE /posts/:songId

* [ ] Search routes
  * [ ] GET /spotify-search
  * [ ] GET /spotify-details/:spotifyId

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

* [ ] Hook up Sentry for monitoring (can test locally)
* [ ] Add Redis client for various caches
* [ ] Add Spotify API client
* [ ] Add Twitter API client
* [ ] Add Apple Music API client
* [ ] Begin using Flyway for production migrations
