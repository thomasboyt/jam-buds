import { Middleware } from 'koa';
import Jareth, { Handle } from '@tboyt/jareth';

export type JarethCtx = { jareth: Handle };

export function jarethMiddleware(jareth: Jareth): Middleware<{}, JarethCtx> {
  return function(ctx, next) {
    return jareth.withHandle(async (handle: Handle) => {
      ctx.jareth = handle;
      await next();
      delete ctx.jareth;
    });
  };
}
