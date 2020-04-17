import Knex from 'knex';
import * as t from 'io-ts';
import validateOrThrow from '../util/validateOrThrow';

/**
 * Turns
 *
 * ```
 * {
 *   "foo.bar": "a",
 *   "foo.baz": "b"
 * }
 * ```
 *
 * into
 *
 * ```
 * {
 *   "foo": {
 *     "bar": "a",
 *     "baz": "b"
 *   }
 * }
 * ```
 */
export function splitByDot(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
    const split = key.split('.');

    if (split.length > 2) {
      throw new Error(
        'found more than one . separator in a result column name, giving up'
      );
    }

    if (split.length === 1) {
      acc[key] = obj[key];
      return acc;
    }

    const [objName, objKey] = split;

    if (!acc[objName]) {
      acc[objName] = { [objKey]: obj[key] };
    } else {
      acc[objName][objKey] = obj[key];
    }

    return acc;
  }, {});
}

export async function findOne<T extends t.TypeC<any>>(
  query: Knex.QueryBuilder,
  model: T
): Promise<t.TypeOf<T> | null> {
  const rows = await query;

  if (rows.length > 1) {
    throw new Error('more than 1 result found for query');
  } else if (rows.length === 0) {
    return null;
  }

  const row = validateOrThrow(model, rows[0]);
  return row;
}

export async function findOneOrThrow<T extends t.TypeC<any>>(
  query: Knex.QueryBuilder,
  model: T
): Promise<t.TypeOf<T>> {
  const row = await findOne(query, model);

  if (!row) {
    throw new Error('no result found for query');
  }

  return row;
}
