import * as t from 'io-ts';
import { db } from '../db';
import { ColorScheme } from '../resources';
import { findOne } from './utils';

const ColorSchemeModelV = t.type({
  id: t.number,
  userId: t.number,
  backgroundGradientName: t.string,
  textColor: t.string,
});

type ColorSchemeModel = t.TypeOf<typeof ColorSchemeModelV>;

export async function getColorSchemeForUserId(
  userId: number
): Promise<ColorScheme | null> {
  const query = db!
    .select('*')
    .from('color_schemes')
    .where({ user_id: userId });

  const colorSchemeModel = await findOne(query, ColorSchemeModelV);

  if (!colorSchemeModel) {
    return null;
  }

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
    backgroundGradientName: colorSchemeModel.backgroundGradientName,
    textColor: colorSchemeModel.textColor,
  };

  return scheme;
}
