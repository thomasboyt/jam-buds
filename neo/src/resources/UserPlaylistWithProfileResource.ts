import { JsonSchema } from 'restea';
import {
  UserPlaylistResource,
  userPlaylistSchema,
} from './UserPlaylistResource';
import { UserProfileResource, userProfileSchema } from './UserProfileResource';

export interface Interface extends UserPlaylistResource {
  userProfile: UserProfileResource;
}

export const userPlaylistWithProfileResourceSchema: JsonSchema<Interface> = {
  allOf: [
    userPlaylistSchema,
    {
      type: 'object',
      required: ['userProfile'],
      properties: {
        userProfile: userProfileSchema,
      },
    },
  ],
};
