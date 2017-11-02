import {makeExecutableSchema} from 'graphql-tools';
import resolvers from './resolvers';

const typeDefs = `
  enum PlaybackSource {
    youtube
    bandcamp
    soundcloud
  }

  # --------------------------
  # Songs & playlists
  # --------------------------

  type Song {
    artists: [String!]!
    album: String!
    title: String!
    albumArt: String!
    spotifyId: String
  }

  input SongInput {
    manualEntry: Boolean!

    artist: String
    title: String
    spotifyId: String

    source: PlaybackSource!
    youtubeUrl: String
    bandcampTrackId: String
    bandcampUrl: String
    soundcloudTrackId: String
    soundcloudUrl: String

    note: String
    tweet: String
  }

  type PlaylistEntry {
    id: Int!
    note: String
    added: String!
    isLiked: Boolean  # null if not a logged in user

    song: Song!
    user: User!

    source: PlaybackSource!
    youtubeUrl: String
    bandcampStreamingUrl: String
    bandcampUrl: String
    soundcloudStreamingUrl: String
    soundcloudUrl: String
  }

  # --------------------------
  # Users
  # --------------------------

  type User {
    id: Int!
    twitterName: String!
    colorScheme: ColorScheme!

    playlist(previousId: Int): [PlaylistEntry!]!
    likes(previousId: Int): [PlaylistEntry!]!

    following: [User!]!
    followers: [User!]!
  }

  type ColorScheme {
    backgroundColor: String!
    textColor: String!
    linkColor: String!
    entryBackgroundColor: String!
    entryTextColor: String!
    entryLinkColor: String!
  }

  input ColorSchemeInput {
    backgroundColor: String!
    textColor: String!
    linkColor: String!
    entryBackgroundColor: String!
    entryTextColor: String!
    entryLinkColor: String!
  }

  # --------------------------
  # Song entry search
  # --------------------------

  type SpotifySearchResult {
    artists: [String!]!
    album: String!
    title: String!
    spotifyId: String!
  }

  type ManualEntrySuggestion {
    title: String!
    artist: String!
  }

  type ShareLinkDetails {
    embeddable: Boolean!
    source: PlaybackSource!
    title: String!

    bandcampTrackId: String
    soundcloudTrackId: String
    spotify: SpotifySearchResult
    manualEntrySuggestion: ManualEntrySuggestion
  }

  # --------------------------
  # Queries and mutations
  # --------------------------

  type Query {
    user(id: Int): User

    # current user-specific queries
    currentUser: User
    friendSuggestions: [User!]!
    feed(previousId: Int): [PlaylistEntry!]!

    spotifySearch(query: String!): [SpotifySearchResult!]!
  }

  type Mutation {
    followUser(id: Int!): User!
    unfollowUser(id: Int!): User!

    likeEntry(id: Int!): PlaylistEntry!
    unlikeEntry(id: Int!): PlaylistEntry!

    setColorScheme(scheme: ColorSchemeInput!): ColorScheme!

    addSongToPlaylist(song: SongInput): PlaylistEntry!
    deletePlaylistEntry(id: Int!): Boolean  # this is kinda weird but eh
  }
`;

export default makeExecutableSchema({typeDefs, resolvers});