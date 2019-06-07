import { Request, Response } from 'express';
import { UserModel, getUserByAuthToken } from './models/user';
import { AUTH_TOKEN_COOKIE } from './constants';

/**
 * Given a request object, return a User.
 */
export async function getUserFromRequest(
  req: Request
): Promise<UserModel | null> {
  let user: UserModel | null = null;

  const token = req.get('X-Auth-Token');
  if (token) {
    user = await getUserByAuthToken(token);
  }

  return user;
}

/**
 * Given a request object, parse the user from the token cookie. Errors if it's
 * not set.
 *
 * Only works on proxied /auth routes, and SHOULD NEVER BE USED FOR NON-GET
 * REQUESTS, as it has no CSRF protection. We're only using it for managing the
 * session when going through external resources auth flows.
 */
export async function getUserFromCookie(req: Request): Promise<UserModel> {
  const token = req.cookies[AUTH_TOKEN_COOKIE];

  if (!token) {
    throw new Error('Missing auth token cookie');
  }

  const user = await getUserByAuthToken(token);

  if (!user) {
    throw new Error('Invalid auth token');
  }

  return user;
}

export async function maybeGetUserFromCookie(
  req: Request
): Promise<UserModel | null> {
  const token = req.cookies[AUTH_TOKEN_COOKIE];

  if (!token) {
    return null;
  }

  const user = await getUserByAuthToken(token);

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Middleware that prevents a user from accessing a resource if they're not authenticated.
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: Function
) {
  const user = await getUserFromRequest(req);

  if (!user) {
    res.status(401).json({
      error: 'Invalid or missing authorization token',
    });

    return;
  } else {
    res.locals.user = user;
  }

  next();
}
