import Knex from 'knex';
import { snakecase } from 'stringcase';
import * as t from 'io-ts';
import { db } from '../db';
import validateOrThrow, { IoTypeC } from '../util/validateOrThrow';

/**
 * Utility function that creates dot-separated select aliases for fields:
 *
 * ```
 * namespacedAliases('books', 'book', ['title', 'author'])
 * ```
 *
 * becomes
 *
 * ```
 * "books"."title" AS "book.title", "books"."author" AS "book.author"
 * ```
 */
export function namespacedAliases(
  tableName: string,
  keyName: string,
  fields: string[]
): string {
  return fields
    .map(
      (fieldName) =>
        `"${tableName}"."${snakecase(fieldName)}" AS "${keyName}.${fieldName}"`
    )
    .join(', ');
}

/**
 * Returns the list of property names of an io-ts Type.
 */
export function tPropNames(ioType: t.TypeC<any>): string[] {
  return Object.keys(ioType.props);
}

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

export function selectNamespacedModel(
  model: t.TypeC<any>,
  tableName: string,
  keyName: string
) {
  return db!.raw(namespacedAliases(tableName, keyName, tPropNames(model)));
}

export function selectModelFields(
  model: t.TypeC<any>,
  tableName: string
): string[] {
  const fields = tPropNames(model);
  return fields.map((field) => `${tableName}.${field}`);
}

export async function findOne<T extends IoTypeC>(
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

export async function findOneOrThrow<T extends IoTypeC>(
  query: Knex.QueryBuilder,
  model: T
): Promise<t.TypeOf<T>> {
  const row = await findOne(query, model);

  if (!row) {
    throw new Error('no result found for query');
  }

  return row;
}

export async function findMany<T extends IoTypeC>(
  query: Knex.QueryBuilder,
  model: T
): Promise<t.TypeOf<T>[]> {
  const rows = await query;
  return rows.map((row: any) => validateOrThrow(model, row));
}
