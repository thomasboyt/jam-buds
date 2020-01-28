import { JsonSchema } from 'restea';

import { SongResource, songResourceSchema } from './SongResource';

export interface FeedSongItemResource {
  type: 'song';
  song: SongResource;
  userNames: string[];
  timestamp: string;
}

export const feedSongItemSchema: JsonSchema<FeedSongItemResource> = {
  type: 'object',
  required: ['type', 'song', 'userNames', 'timestamp'],
  properties: {
    type: {
      const: 'song',
    },
    song: songResourceSchema,
    userNames: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
