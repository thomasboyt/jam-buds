import {resolveUser, userResolvers} from './user';

export default {
  Query: {
    user: resolveUser,
  },

  User: userResolvers,
  // PlaylistEntry: playlistEntryResolvers,

  Mutation: {
  },
}