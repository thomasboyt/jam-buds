export interface SearchResult {
  artists: string[];
  album: string;
  title: string;
  spotifyId: string;
}

export interface Song {
  id: number;
  artists: string[];
  album: string | null;
  title: string;
  albumArt: string | null;
  spotifyId: string | null;
  appleMusicId: string | null;
  appleMusicUrl: string | null;
  isLiked: boolean;
}

/**
 * A PlaylistEntry represents a song in a playlist. It can be from one of several sources:
 *
 * - An aggregated "feed entry," when viewing your feed.
 * - A `post` row, used when viewing a user's playlist
 * - A `like` row, used when viewing a user's likes
 *
 * The goal of this resource is to be one-size-fits-all.
 */
export interface PlaylistEntry {
  /**
   * The Song object.
   */
  song: Song;

  /**
   * A list of names of users who posted or liked the song.
   */
  userNames: string[];

  /**
   * Has several meanings depending on type:
   *
   * - For feed posts: the earliest time a song was posted by someone you
   *   follow, or the time _you_ posted the song
   * - For a playlist: the time the playlist user posted the song
   * - For a like: the time the like song was liked
   */
  timestamp: string;
}

export interface Feed {
  tracks: PlaylistEntry[];
  limit: number;
}

export interface Playlist {
  userProfile: UserProfile;
  tracks: PlaylistEntry[];
  limit: number;
}

export interface PublicUser {
  id: number;
  name: string;
}

export interface PublicUserWithTwitter extends PublicUser {
  twitterName: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  colorScheme: ColorScheme | null;
}

export interface CurrentUser {
  id: number;
  name: string;
  following: PublicUser[];
  colorScheme: ColorScheme | null;
  twitterName: string | null;
  hasSpotify: boolean;
  showInPublicFeed: boolean;
  email: string;
}

export interface Followers {
  userProfile: UserProfile;
  users: PublicUser[];
}

export type Following = Followers;

export interface ColorScheme {
  backgroundGradientName: string;
  textColor: string;
}

export interface Mixtape {
  // TODO: add UserProfile here for display
  id: number;
  title: string;
  tracks: Song[];
  isPublished: boolean;
  author: UserProfile;
}
