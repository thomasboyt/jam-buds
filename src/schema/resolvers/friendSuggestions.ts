import {serializePublicUser, getUnfollowedUsersByTwitterIds} from '../../server/models/user';
import {getTwitterFriendIds} from '../../server/apis/twitter';

export async function resolveFriendSuggestions(rootValue: any, args: any, context: any): Promise<any[]> {
  const ids = await getTwitterFriendIds(context.user);

  const users = await getUnfollowedUsersByTwitterIds(context.user.id, ids);

  const publicUsers = users.map((row) => serializePublicUser(row));

  return publicUsers;
}