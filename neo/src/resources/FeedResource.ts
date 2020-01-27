import { JsonSchema } from 'restea';
import * as FeedMixtapeItemResource from './FeedMixtapeItemResource';
import * as FeedSongItemResource from './FeedSongItemResource';

export type FeedItem =
  | FeedSongItemResource.Interface
  | FeedMixtapeItemResource.Interface;

export interface Interface {
  items: FeedItem[];
  limit: number;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['items', 'limit'],
  properties: {
    items: {
      type: 'array',
      items: {
        oneOf: [FeedSongItemResource.schema, FeedMixtapeItemResource.schema],
      },
    },
    limit: {
      type: 'number',
    },
  },
};
