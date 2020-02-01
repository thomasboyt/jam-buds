import { JsonSchema } from 'restea';

import {
  MixtapePreviewResource,
  mixtapePreviewSchema,
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
    mixtape: mixtapePreviewSchema,
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
