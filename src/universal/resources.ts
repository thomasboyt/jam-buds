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
}
