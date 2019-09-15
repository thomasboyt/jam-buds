import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

export default function validateOrThrow<A, O, I>(
  codec: t.Type<A, O, I>,
  obj: any
): A {
  const result = codec.decode(obj);

  if (isLeft(result)) {
    const report = PathReporter.report(result).join('\n');
    throw new Error(report);
  }

  return result.right;
}
