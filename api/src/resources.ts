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
  isLiked: boolean;
}

/**
 * A PlaylistEntry maps to a Post object internally. It's used for representing
 * a post from a specific user.
 */
export interface PlaylistEntry {
  /**
   * The Song object.
   */
  song: Song;

  /**
   * When the post was created.
   */
  timestamp: string;

  /**
   * The ID of the underlying Post. Not sure this should actually be exposed.
   * Maybe useful for deletes?
   */
  id: number;
}

/**
 * A FeedEntry object is an aggregated entry that could be posted by multiple
 * users. They're pretty similar and could probably be deduped a bit, but they
 * are sourced from different places.
 */
export interface FeedEntry {
  /**
   * The Song object.
   */
  song: Song;

  /**
   * A list of names of users who posted the song.
   */
  postedBy: string[];

  /**
   * The first time a song was added to your feed. If you follow both users A
   * and B, and they both post the song, the earliest of the two posts's created
   * timestamps will be listed here.
   */
  timestamp: string;
}

/**
 * Represents a song that was "liked" by a given user.
 */
export interface LikeEntry {
  /**
   * The Song object.
   */
  song: Song;

  /**
   * When the like was created.
   */
  timestamp: string;
}

export interface Feed {
  tracks: FeedEntry[];
  limit: number;
}

export interface Playlist {
  userProfile: UserProfile;
  tracks: PlaylistEntry[] | LikeEntry[];
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
  colorScheme: ColorScheme;
}

export interface CurrentUser {
  id: number;
  name: string;
  following: PublicUser[];
  colorScheme: ColorScheme;
  twitterName: string | null;
  hasSpotify: boolean;
}

export interface Followers {
  userProfile: UserProfile;
  users: PublicUser[];
}

export type Following = Followers;

export interface ColorScheme {
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
}
