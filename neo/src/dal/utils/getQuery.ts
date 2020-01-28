import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

const queryCache: { [key: string]: string } = {};

export default function getQuery(key: string): string {
  if (!queryCache[key] || process.env.NODE_ENV !== 'production') {
    queryCache[key] = readFileSync(
      pathJoin(process.cwd(), `queries/${key}.sql`),
      { encoding: 'utf8' }
    );
  }
  return queryCache[key];
}
