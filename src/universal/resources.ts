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
}

export interface Followers {
  userProfile: UserProfile;
  users: PublicUser[];
}

export interface Following extends Followers {}

export interface ShareLinkDetails {
  title: string;
  embeddable: boolean;
}

export interface ColorScheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  entryBackgroundColor: string;
  entryTextColor: string;
  entryLinkColor: string;
}