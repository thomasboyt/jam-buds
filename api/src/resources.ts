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

/*
 * --- mixtapes ---
 */

export interface MixtapePreview {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  numTracks: number;
}

export interface Mixtape {
  id: number;
  slug: string;
  title: string;
  tracks: Song[];
  isPublished: boolean;
  publishedAt: string | null;
  author: UserProfile;
}

export interface DraftMixtapeListItem {
  id: number;
  title: string;
  slug: string;
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
