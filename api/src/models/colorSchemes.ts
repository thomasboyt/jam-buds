import * as t from 'io-ts';
import { db } from '../db';
import { ColorScheme } from '../resources';
import { defaultColorScheme } from '../constants';
import validateOrThrow from '../util/validateOrThrow';

const ColorSchemeModelV = t.type({
  id: t.number,
  userId: t.number,
  backgroundColor: t.string,
  textColor: t.string,
  linkColor: t.string,
});

type ColorSchemeModel = t.TypeOf<typeof ColorSchemeModelV>;

export async function getColorSchemeForUserId(
  userId: number
): Promise<ColorScheme> {
  const query = db!
    .select('*')
    .from('color_schemes')
    .where({ user_id: userId });

  const [row] = await query;

  if (!row) {
    return defaultColorScheme;
  }

  const colorSchemeModel = validateOrThrow(ColorSchemeModelV, row);

  return serializeColorScheme(colorSchemeModel);
}

export async function setColorSchemeForUserId(
  userId: number,
  colorScheme: ColorScheme
): Promise<void> {
  // delete any existing color scheme
  // TODO: this should be a transaction probably
  const deleteQuery = db!('color_schemes')
    .where({ user_id: userId })
    .delete();

  await deleteQuery;

  const row: Partial<ColorSchemeModel> = {
    userId,
    ...colorScheme,
  };

  const query = db!('color_schemes').insert(row);

  await query;
}

function serializeColorScheme(colorSchemeModel: ColorSchemeModel): ColorScheme {
  // XXX: Manually "serializing" to an object literal like this seems to be the
  // only way in TS to error if extra props are present
  const scheme: ColorScheme = {
    linkColor: colorSchemeModel.linkColor,
    backgroundColor: colorSchemeModel.backgroundColor,
    textColor: colorSchemeModel.textColor,
  };

  return scheme;
}
