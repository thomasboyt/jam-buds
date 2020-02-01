import { JsonSchema } from 'restea';

export interface MixtapePreviewResource {
  id: number;
  title: string;
  slug: string;
  authorName: string;
  numTracks: number;
}

export const mixtapePreviewSchema: JsonSchema<MixtapePreviewResource> = {
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
