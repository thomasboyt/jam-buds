export interface SearchResult {
  artists: string[];
  album: string;
  name: string;
  spotifyId: string;
}

export interface Song {
  id: number;
  artists: string[];
  album: string;
  title: string;
  albumArt: string;
  spotifyId: string;
  isLiked: boolean;
}

export interface PlaylistEntry {
  id: number;
  note: string | null;
  added: string;
  song: Song;
  user: PublicUser;
}

export interface Feed {
  tracks: PlaylistEntry[];
  limit: number;
}

export interface PublicUser {
  id: number;
  name: string;
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

export interface Playlist {
  userProfile: UserProfile;
  tracks: PlaylistEntry[];
  limit: number;
}

export interface Followers {
  userProfile: UserProfile;
  users: PublicUser[];
}

export type Following = Followers;

export interface ColorScheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
}
