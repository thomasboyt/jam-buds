export type PlaybackSource = 'youtube' | 'bandcamp' | 'soundcloud';

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
  twitterName: string;
}

export interface UserProfile {
  id: number;
  twitterName: string;
  colorScheme: ColorScheme;
}

export interface CurrentUser {
  id: number;
  name: string;
  following: PublicUser[];
  colorScheme: ColorScheme;
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

export interface Following extends Followers {}

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
  entryBackgroundColor: string;
  entryTextColor: string;
  entryLinkColor: string;
}