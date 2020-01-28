import { JsonSchema } from 'restea';

import {
  MixtapePreviewResource,
  mixtapePreviewResourceSchema,
} from './MixtapePreviewResource';

export interface UserPlaylistMixtapeItemResource {
  type: 'mixtape';
  mixtape: MixtapePreviewResource;
  timestamp: string;
}

export const userPlaylistMixtapeItemSchema: JsonSchema<
  UserPlaylistMixtapeItemResource
> = {
  type: 'object',
  required: ['type', 'mixtape', 'timestamp'],
  properties: {
    type: {
      const: 'mixtape',
    },
    mixtape: mixtapePreviewResourceSchema,
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
