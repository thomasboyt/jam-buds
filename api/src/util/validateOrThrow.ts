import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export type IoTypeC = t.TypeC<any> | t.IntersectionC<any>;

export default function validateOrThrow<T extends IoTypeC>(
  codec: T,
  obj: any
): t.TypeOf<T> {
  const result = t.exact(codec).decode(obj);

  if (isLeft(result)) {
    const report = PathReporter.report(result).join('\n');
    throw new Error(report);
  }

  return result.right;
}
