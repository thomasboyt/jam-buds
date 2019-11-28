import Knex from 'knex';
import { snakecase } from 'stringcase';
import * as t from 'io-ts';
import { db } from '../db';

interface PaginationOptions {
  limit: number;
  columnName: string;
  before?: string;
  after?: string;
}

/**
 * Only use this for playlist pagination, due to the weird limiting rules
 */
export function paginate(query: Knex.QueryBuilder, opts: PaginationOptions) {
  if (opts.before !== undefined) {
    query = query.where(opts.columnName, '<', opts.before);
  }
  if (opts.after !== undefined) {
    query = query.where(opts.columnName, '>', opts.after);
  }

  // after queries are unlimited since there's no UI for "head" pagination
  if (opts.after === undefined) {
    query = query.limit(opts.limit);
  }

  return query;
}

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
