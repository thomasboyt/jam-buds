// See http://madole.xyz/error-handling-in-express-with-async-await-routes/

import Express from 'express';

export type PromiseRequestHandler = (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => Promise<any>;

export default function wrapAsyncRoute(
  fn: PromiseRequestHandler
): Express.RequestHandler {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);

    routePromise.catch((err) => next(err));
  };
}
