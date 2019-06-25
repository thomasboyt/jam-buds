import express from 'express';
import { AxiosError, AxiosResponse } from 'axios';
import { ClientRequest } from 'http';

function getExternalErrorDetail(err: AxiosError) {
  if (err.response) {
    return `${err.response.status} ${err.response.statusText}`;
  } else {
    return err.message;
  }
}

export class ExternalApiCallError extends Error {
  request: ClientRequest;
  response?: AxiosResponse<any>;

  constructor(err: AxiosError) {
    const method = (err.config.method || 'get').toUpperCase();
    const msg = `${method} ${err.config.url}: ${getExternalErrorDetail(err)}`;
    super(msg);

    this.request = err.request;
    this.response = err.response;
  }
}

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
  if (err instanceof JamBudsHTTPError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  next(err);
};
