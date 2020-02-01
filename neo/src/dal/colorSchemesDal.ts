import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { ColorScheme } from './models';

export async function getColorSchemeByUserId(
  handle: Handle,
  params: { userId: number }
): Promise<ColorScheme.Model | null> {
  const queryString = getQuery('getColorSchemeByUserId');

  return await handle
    .createQuery(queryString)
    .oneOrNone(params, mapDecode(ColorScheme.codec));
}
