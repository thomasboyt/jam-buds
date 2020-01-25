import { JsonSchema } from 'restea';

import * as SongResource from './SongResource';

export interface Interface {
  type: 'song';
  song: SongResource.Interface;
  userNames: string[];
  timestamp: string;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['type', 'mixtape', 'timestamp'],
  properties: {
    type: {
      const: 'song',
    },
    song: SongResource.schema,
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
