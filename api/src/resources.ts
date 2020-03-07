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

export interface Followers {
  userProfile: UserProfile;
  users: PublicUser[];
}

export type Following = Followers;

export interface ColorScheme {
  backgroundGradientName: string;
  textColor: string;
}
