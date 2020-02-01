import { JsonSchema } from 'restea';

import { SongResource, songSchema } from './SongResource';

export interface UserPlaylistSongItemResource {
  type: 'song';
  song: SongResource;
  timestamp: string;
}

export const userPlaylistSongItemSchema: JsonSchema<
  UserPlaylistSongItemResource
> = {
  type: 'object',
  required: ['type', 'song', 'timestamp'],
  properties: {
    type: {
      const: 'song',
    },
    song: songSchema,
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
