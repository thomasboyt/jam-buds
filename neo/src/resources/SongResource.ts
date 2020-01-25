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
      type: 'string',
    },
    spotifyId: {
      type: 'string',
    },
    appleMusicId: {
      type: 'string',
    },
    appleMusicUrl: {
      type: 'string',
    },
    isLiked: {
      type: 'boolean',
    },
    likeCount: {
      type: 'number',
    },
  },
};
