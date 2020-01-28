import { Handle } from '@tboyt/jareth';
import { UserProfileResource } from '../resources';
import { getUserByUserNameOrNull } from '../dal/usersDal';
import { getColorSchemeByUserId } from '../dal/colorSchemesDal';

export async function getUserProfileOrNull(
  handle: Handle,
  userName: string
): Promise<UserProfileResource | null> {
  const user = await getUserByUserNameOrNull(handle, { userName });

  if (!user) {
    return null;
  }

  const colorScheme = await getColorSchemeByUserId(handle, { userId: user.id });

  // TODO: should get some kind of type-aware pick() utility for this
  const serializedColorScheme = colorScheme
    ? {
        backgroundGradientName: colorScheme.backgroundGradientName,
        textColor: colorScheme.textColor,
      }
    : null;

  return {
    id: user.id,
    name: user.name,
    colorScheme: serializedColorScheme,
  };
}
