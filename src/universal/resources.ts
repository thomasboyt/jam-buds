export interface SearchResult {
  artists: string[];
  album: string;
  name: string;
  spotifyId: string;
}

export interface Song {
  artists: string[];
  album: string;
  title: string;
  albumArt: string;
  spotifyId: string;
}

export interface PlaylistEntry {
  id: number;
  youtubeUrl: string;
  note: string | null;
  added: string;
  isLiked: boolean;

  song: Song;
  user: PublicUser;
}

export interface Feed {
  tracks: PlaylistEntry[];
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

export interface ShareLinkDetails {
  title: string;
  embeddable: boolean;
}
