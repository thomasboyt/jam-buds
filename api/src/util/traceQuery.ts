import * as Knex from 'knex';
import { get as getAgent } from '@google-cloud/trace-agent';

export default function traceQuery(query: Knex.QueryBuilder): PromiseLike<any> {
  const tracer = getAgent();
  const span = tracer.createChildSpan({ name: 'knex' });

  return query.finally(() => {
    span.endSpan();
  });
}
