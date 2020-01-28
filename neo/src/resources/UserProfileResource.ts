import { JsonSchema } from 'restea';
import { ColorSchemeResource, colorSchemeSchema } from './ColorSchemeResource';

export interface UserProfileResource {
  id: number;
  name: string;
  colorScheme: ColorSchemeResource | null;
}

export const userProfileSchema: JsonSchema<UserProfileResource> = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    colorScheme: {
      oneOf: [colorSchemeSchema, { type: 'null' }],
    },
  },
};
