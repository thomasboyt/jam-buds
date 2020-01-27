import { Middleware } from 'koa';
import { HttpError } from 'restea';
import { User } from '../dal/models';
import { JarethCtx } from './jarethMiddleware';
import { getUserByAuthTokenOrNull } from '../dal/usersDal';

export type RequiredUserState = { currentUser: User.Model };
export type OptionalUserState = { currentUser: User.Model | null };

const tokenHeader = 'x-auth-token';

class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, 'Unauthorized', message);
  }
}

function ensureJareth(ctx: JarethCtx) {
  if (!ctx.jareth) {
    throw new Error(
      'jareth missing in authMiddleware context - must be earlier in middleware chain'
    );
  }
}

export function requireAuthMiddleware(): Middleware<
  RequiredUserState,
  JarethCtx
> {
  return async function(ctx, next) {
    ensureJareth(ctx);

    const token = ctx.request.headers[tokenHeader];
    if (!token) {
      throw new UnauthorizedError(`missing auth token header ${tokenHeader}`);
    }

    const user = await getUserByAuthTokenOrNull(ctx.jareth, {
      authToken: ctx.request.header[tokenHeader],
    });

    if (!user) {
      throw new UnauthorizedError('invalid auth token');
    }

    ctx.state.currentUser = user;
    await next();
  };
}

export function optionalAuthMiddleware(): Middleware<
  OptionalUserState,
  JarethCtx
> {
  return async function(ctx, next) {
    ensureJareth(ctx);

    const token = ctx.request.headers[tokenHeader];
    if (!token) {
      await next();
      return;
    }

    const user = await getUserByAuthTokenOrNull(ctx.jareth, {
      authToken: ctx.request.header[tokenHeader],
    });

    ctx.state.currentUser = user;
    await next();
  };
}
