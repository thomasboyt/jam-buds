export type PlaybackSource = 'youtube' | 'bandcamp' | 'soundcloud' | 'spotify';

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
  note: string | null;
  added: string;
  isLiked: boolean;

  song: Song;
  user: PublicUser;

  source: PlaybackSource;
  youtubeUrl?: string;

  bandcampStreamingUrl?: string;
  bandcampUrl?: string;

  soundcloudStreamingUrl?: string;
  soundcloudUrl?: string;
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

export interface ManualEntrySuggestion {
  title: string;
  artist: string;
}

export interface ShareLinkDetails {
  embeddable: boolean;
  source: PlaybackSource;
  title: string;

  bandcampTrackId?: string;
  soundcloudTrackId?: string;
  spotify?: SearchResult | null;
  manualEntrySuggestion?: ManualEntrySuggestion;
}

export interface ColorScheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
}
