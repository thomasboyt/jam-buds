import {Express, Request, Response} from 'express';
import {User, getUserByAuthToken} from './models/user';

/**
 * Given a request object, return a User.
 */
export async function getUserFromRequest(req: Request): Promise<User | null> {
  let user: User | null = null;

  const token = req.get('X-Auth-Token');
  if (token) {
    user = await getUserByAuthToken(token);
  }

  return user;
}

/**
 * Middleware that prevents a user from accessing a resource if they're not authenticated.
 */
export async function isAuthenticated(req: Request, res: Response, next: Function) {
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
