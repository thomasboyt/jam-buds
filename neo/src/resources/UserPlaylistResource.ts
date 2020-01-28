import { JsonSchema } from 'restea';
import {
  UserPlaylistMixtapeItemResource,
  userPlaylistMixtapeItemSchema,
} from './UserPlaylistMixtapeItemResource';
import {
  UserPlaylistSongItemResource,
  userPlaylistSongItemSchema,
} from './UserPlaylistSongItemResource';

export type UserPlaylistItem =
  | UserPlaylistSongItemResource
  | UserPlaylistMixtapeItemResource;

export interface UserPlaylistResource {
  items: UserPlaylistItem[];
  limit: number;
}

export const userPlaylistSchema: JsonSchema<UserPlaylistResource> = {
  type: 'object',
  required: ['items', 'limit'],
  properties: {
    items: {
      type: 'array',
      items: {
        oneOf: [userPlaylistMixtapeItemSchema, userPlaylistSongItemSchema],
      },
    },
    limit: {
      type: 'number',
    },
  },
};
