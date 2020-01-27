import { JsonSchema } from 'restea';
import * as ColorSchemeResource from './ColorSchemeResource';

export interface Interface {
  id: number;
  name: string;
  colorScheme: ColorSchemeResource.Interface | null;
}

export const schema: JsonSchema<Interface> = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    colorScheme: ColorSchemeResource.schema,
  },
};
