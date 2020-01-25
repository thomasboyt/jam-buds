import { JsonSchema } from 'restea';

export interface Interface {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  numTracks: number;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['id', 'title', 'slug', 'authorName', 'numTracks'],
  properties: {
    id: {
      type: 'number',
    },
    title: {
      type: 'string',
    },
    slug: {
      type: 'string',
    },
    authorName: {
      type: 'string',
    },
    numTracks: {
      type: 'number',
    },
  },
};
