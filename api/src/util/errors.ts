import express from 'express';

/**
 * Represents an HTTP error that gets thrown and serialized as
 *
 * {
 *   error: 'Message here'
 * }
 *
 * with an HTTP status code
 */
export class JamBudsHTTPError extends Error {
  statusCode: number;

  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: number;
  }) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandlerMiddleware: express.ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err.stack);

  if (err instanceof JamBudsHTTPError) {
    console.log('hi!');

    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  next(err);
};
