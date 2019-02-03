import { db } from '../db';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { ColorScheme } from '../resources';
import { defaultColorScheme } from '../constants';

export async function getColorSchemeForUserId(
  userId: number
): Promise<ColorScheme> {
  const query = db!
    .select('*')
    .from('color_schemes')
    .where({ user_id: userId });

  const [row] = await (query as any);

  if (!row) {
    return defaultColorScheme;
  }

  delete row.user_id;
  delete row.id;

  return camelizeKeys(row) as ColorScheme;
}

export async function setColorSchemeForUserId(
  userId: number,
  colorScheme: ColorScheme
): Promise<void> {
  // delete any existing color scheme
  const deleteQuery = db!('color_schemes')
    .where({ user_id: userId })
    .delete();

  await (deleteQuery as any);

  const query = db!('color_schemes').insert({
    user_id: userId,
    ...decamelizeKeys(colorScheme),
  });

  await (query as any);
}
