import Knex from 'knex';

interface PaginationOptions {
  limit: number;
  idColumn: string;
  previousId?: number;
}

export function paginate(query: Knex.QueryBuilder, opts: PaginationOptions) {
  if (opts.previousId !== undefined) {
    query = query.where(opts.idColumn, '<', opts.previousId);
  }

  query = query.limit(opts.limit);

  return query;
}
