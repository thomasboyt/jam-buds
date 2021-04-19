import { ApiSchema } from '~/api/_helpers';

export type JamType = 'album' | 'song' | 'mixtape';
export type SelectedItem =
  | ApiSchema<'SongSearchResult'>
  | ApiSchema<'AlbumSearchResult'>;
export type SearchResults =
  | ApiSchema<'AlbumSearchResult'>[]
  | ApiSchema<'SongSearchResult'>[];
