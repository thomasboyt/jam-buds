import { JsonSchema } from 'restea';
import * as UserPlaylistMixtapeItemResource from './UserPlaylistMixtapeItemResource';
import * as UserPlaylistSongItemResource from './UserPlaylistSongItemResource';

export type UserPlaylistItem =
  | UserPlaylistSongItemResource.Interface
  | UserPlaylistMixtapeItemResource.Interface;

export interface Interface {
  items: UserPlaylistItem[];
  limit: number;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['items', 'limit'],
  properties: {
    items: {
      type: 'array',
      items: {
        oneOf: [
          UserPlaylistSongItemResource.schema,
          UserPlaylistMixtapeItemResource.schema,
        ],
      },
    },
    limit: {
      type: 'number',
    },
  },
};
