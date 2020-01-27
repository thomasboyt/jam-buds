import { JsonSchema } from 'restea';

export interface Interface {
  backgroundGradientName: string;
  textColor: string;
}

export const schema: JsonSchema<Interface> = {
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
