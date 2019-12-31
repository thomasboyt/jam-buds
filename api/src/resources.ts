export interface SearchResult {
  artists: string[];
  album: string;
  title: string;
  spotifyId: string;
  albumArt: string;
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
  likeCount: number;
}

export interface PostListMixtapeItem {
  type: 'mixtape';
  mixtape: MixtapePreview;
  timestamp: string;
}

export interface PostListSongItem {
  type: 'song';

  song: Song;

  /**
   * Either the earliest time a song was posted by someone you follow, or the
   * earliest time _you_ posted a song.
   */
  timestamp: string;

  /**
   * A list of names of users you follow who posted the song.
   */
  userNames: string[];
}

export type PostListItem = PostListSongItem | PostListMixtapeItem;

export interface PostList {
  items: PostListItem[];
  limit: number;
}

/**
 * The post list for a specific user, used on the profile pages.
 */
export interface UserPostList {
  userProfile: UserProfile;
  items: PostListItem[];
  limit: number;
}

/*
 *  --- likes ---
 */

// likes are very similar to posts with some stuff missing
// may change in the future...

export interface LikedSongItem {
  type: 'song';
  song: Song;
  /** the time a song was liked */
  timestamp: string;
}

export interface UserLikeList {
  userProfile: UserProfile;
  items: LikedSongItem[];
  limit: number;
}

/*
 * --- mixtapes ---
 */

export interface MixtapePreview {
  id: number;
  title: string;
  authorName: string;
  numTracks: number;
}

export interface Mixtape {
  id: number;
  title: string;
  tracks: Song[];
  isPublished: boolean;
  publishedAt: string | null;
  author: UserProfile;
}

export interface DraftMixtapeListItem {
  id: number;
  title: string;
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

export interface Notification {
  id: number;
  type: 'like' | 'follow' | 'joined' | 'system';
  user?: PublicUser | PublicUserWithTwitter;
  song?: Song;
  message?: string;
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
  unreadNotificationCount: number;
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
