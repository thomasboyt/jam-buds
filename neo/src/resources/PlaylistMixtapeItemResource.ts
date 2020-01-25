import { JsonSchema } from 'restea';

import * as MixtapePreviewResource from './MixtapePreviewResource';

export interface Interface {
  type: 'mixtape';
  mixtape: MixtapePreviewResource.Interface;
  timestamp: string;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['type', 'mixtape', 'timestamp'],
  properties: {
    type: {
      const: 'song',
    },
    mixtape: MixtapePreviewResource.schema,
    timestamp: {
      type: 'string',
      format: 'date-time',
    },
  },
};
