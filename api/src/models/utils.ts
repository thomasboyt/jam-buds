import Knex from 'knex';

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
