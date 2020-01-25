import { JsonSchema } from 'restea';
import * as PlaylistMixtapeItemResource from './PlaylistMixtapeItemResource';
import * as PlaylistSongItemResource from './PlaylistSongItemResource';

type PlaylistItem =
  | PlaylistSongItemResource.Interface
  | PlaylistMixtapeItemResource.Interface;

export interface Interface {
  items: PlaylistItem[];
  limit: number;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['items', 'limit'],
  properties: {
    items: {
      type: 'array',
      items: [
        PlaylistSongItemResource.schema,
        PlaylistMixtapeItemResource.schema,
      ],
    },
    limit: {
      type: 'number',
    },
  },
};
