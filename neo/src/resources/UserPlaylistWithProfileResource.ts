import { JsonSchema } from 'restea';
import * as UserPlaylistResource from './UserPlaylistResource';
import * as UserProfileResource from './UserProfileResource';

export interface Interface extends UserPlaylistResource.Interface {
  userProfile: UserProfileResource.Interface;
}

export const schema: JsonSchema<Interface> = {
  allOf: [
    UserPlaylistResource.schema,
    {
      type: 'object',
      required: ['userProfile'],
      properties: {
        userProfile: UserProfileResource.schema,
      },
    },
  ],
};
