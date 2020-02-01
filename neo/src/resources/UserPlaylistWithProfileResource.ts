import { JsonSchema } from 'restea';
import {
  UserPlaylistResource,
  userPlaylistSchema,
} from './UserPlaylistResource';
import { UserProfileResource, userProfileSchema } from './UserProfileResource';

export interface UserPlaylistWithProfileResource extends UserPlaylistResource {
  userProfile: UserProfileResource;
}

export const userPlaylistWithProfileSchema: JsonSchema<
  UserPlaylistWithProfileResource
> = {
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
