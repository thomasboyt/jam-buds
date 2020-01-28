import {
  UserPlaylistMixtapeItemResource,
  userPlaylistMixtapeItemSchema,
} from './UserPlaylistMixtapeItemResource';

export type FeedMixtapeItemResource = UserPlaylistMixtapeItemResource;
export const feedMixtapeItemSchema = userPlaylistMixtapeItemSchema;
