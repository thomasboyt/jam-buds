import {getUserByUserId, getColorSchemeForUserId} from '../../server/models/user';
import {getFollowingForUserId, getFollowersForUserId} from '../../server/models/following';
import {getPlaylistByUserId, getLikedEntriesByUserId} from '../../server/models/playlist';

// TODO: OH GOD WHERE DO THESE GO NOW D:
interface User {
  id: number;
  twitterName: string;
}

interface ColorScheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  entryBackgroundColor: string;
  entryTextColor: string;
  entryLinkColor: string;
}

interface UserInput {
  id: number;
}

interface PlaylistArgs {
  previousId?: number;
}

export async function resolveUser(rootValue: any, args: UserInput, context: any): Promise<User | null> {
  const user = await getUserByUserId(args.id);
  return user;
}

export const userResolvers = {
  async colorScheme(user: User, args: any, context: any): Promise<ColorScheme> {
    return await getColorSchemeForUserId(user.id);
  },

  async following(user: User, args: any, context: any): Promise<User[]> {
    return await getFollowingForUserId(user.id);
  },

  async followers(user: User, args: any, context: any): Promise<User[]> {
    return await getFollowersForUserId(user.id);
  },

  async playlist(user: User, args: PlaylistArgs, context: any): Promise<any[]> {
    return await getPlaylistByUserId(user.id, {
      // TODO: Pass in currentUserId from context
      // currentUserId: context.currentUser.id,
      previousId: args.previousId,
    });
  },

  async likes(user: User, args: PlaylistArgs, context: any): Promise<any[]> {
    return await getLikedEntriesByUserId(user.id, {
      // TODO: Pass in currentUserId from context
      // currentUserId: context.currentUser.id,
      previousId: args.previousId,
    });
  },
};