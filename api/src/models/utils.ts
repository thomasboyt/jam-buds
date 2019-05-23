import Knex from 'knex';

interface PaginationOptions {
  limit: number;
  columnName: string;
  before?: string;
}

export function paginate(query: Knex.QueryBuilder, opts: PaginationOptions) {
  if (opts.before !== undefined) {
    query = query.where(opts.columnName, '<', opts.before);
  }

  query = query.limit(opts.limit);

  return query;
}
