import { JsonSchema } from 'restea';
import {
  FeedMixtapeItemResource,
  feedMixtapeItemSchema,
} from './FeedMixtapeItemResource';
import {
  FeedSongItemResource,
  feedSongItemSchema,
} from './FeedSongItemResource';

export type FeedItem = FeedSongItemResource | FeedMixtapeItemResource;

export interface FeedResource {
  items: FeedItem[];
  limit: number;
}

export const feedSchema: JsonSchema<FeedResource> = {
  type: 'object',
  required: ['items', 'limit'],
  properties: {
    items: {
      type: 'array',
      items: {
        oneOf: [feedMixtapeItemSchema, feedSongItemSchema],
      },
    },
    limit: {
      type: 'number',
    },
  },
};
