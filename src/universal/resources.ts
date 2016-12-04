export interface SearchResult {
  artists: string[];
  album: string;
  name: string;
  spotifyId: string;
}

export interface PlaylistEntry {
  id: number;
  artists: string[];
  album: string;
  title: string;
  youtubeUrl: string;
  albumArt: string;
  note: string | null;
}

export interface FeedEntry {
  song: PlaylistEntry;
  user: PublicUser;
}

export interface Feed {
  tracks: FeedEntry[];
}

export interface PublicUser {
  id: number;
  twitterName: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  following: PublicUser[];
}

export interface Playlist {
  user: PublicUser;
  tracks: PlaylistEntry[];
}