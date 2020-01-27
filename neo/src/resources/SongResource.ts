import { JsonSchema } from 'restea';

export interface Interface {
  id: number;
  artists: string[];
  album: string | null;
  title: string;
  albumArt: string | null;
  spotifyId: string | null;
  appleMusicId: string | null;
  appleMusicUrl: string | null;
  isLiked: boolean;
  likeCount: number;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['id', 'artists', 'album', 'title', 'isLiked', 'likeCount'],
  properties: {
    id: {
      type: 'number',
    },
    artists: {
      type: 'array',
      items: [{ type: 'string' }],
    },
    title: {
      type: 'string',
    },
    albumArt: {
      type: ['string', 'null'],
    },
    spotifyId: {
      type: ['string', 'null'],
    },
    appleMusicId: {
      type: ['string', 'null'],
    },
    appleMusicUrl: {
      type: ['string', 'null'],
    },
    isLiked: {
      type: 'boolean',
    },
    likeCount: {
      type: 'number',
    },
  },
};
