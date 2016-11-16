import {Express, Request, Response} from 'express';
import {User, getUserByAuthToken} from './models/user';

export async function getUserFromRequest(req: Request): Promise<User | null> {
  let user: User | null = null;

  if (req.query.authToken) {
    user = await getUserByAuthToken(req.query.authToken);
  }

  return user;
}

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
