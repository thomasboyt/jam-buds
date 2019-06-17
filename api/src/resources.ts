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

export interface FeedMixtapeItem {
  type: 'mixtape';
  mixtape: MixtapePreview;
  timestamp: string;
}

export interface FeedSongItem {
  type: 'song';

  song: Song;

  /**
   * A list of names of users you follow who posted or liked the song.
   */
  userNames: string[];

  /**
   * Either the earliest time a song was posted by someone you follow, or the
   * earliest time _you_ posted a song.
   */
  timestamp: string;
}

export type FeedItem = FeedSongItem | FeedMixtapeItem;

export interface Feed {
  items: FeedItem[];
  limit: number;
}

/*
 *  --- playlists ---
 */

export interface UserSongItem {
  song: Song;
  timestamp: string;
}

/**
 * A song list for a given user. Can be used for "playlist" (user's posts) or
 * liked tracks.
 */
export interface UserSongList {
  userProfile: UserProfile;
  items: UserSongItem[];
  limit: number;
}

/*
 * --- mixtapes ---
 */

export interface MixtapePreview {
  id: number;
  title: string;
  authorName: string;
}

export interface Mixtape {
  id: number;
  title: string;
  tracks: Song[];
  isPublished: boolean;
  author: UserProfile;
}

/*
 * --- users ---
 */

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
