import {resolveUser, userResolvers} from './user';
import {resolveFriendSuggestions} from './friendSuggestions';

export default {
  Query: {
    user: resolveUser,
    friendSuggestions: resolveFriendSuggestions,
  },

  User: userResolvers,
  // PlaylistEntry: playlistEntryResolvers,

  Mutation: {
  },
}