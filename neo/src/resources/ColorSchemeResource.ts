import { JsonSchema } from 'restea';

export interface ColorSchemeResource {
  backgroundGradientName: string;
  textColor: string;
}

export const colorSchemeSchema: JsonSchema<ColorSchemeResource> = {
  type: 'object',
  required: ['backgroundGradientName', 'textColor'],
  properties: {
    backgroundGradientName: {
      type: 'string',
    },
    textColor: {
      type: 'string',
    },
  },
};
