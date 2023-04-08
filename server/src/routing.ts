import { Response, Router } from 'express';
import logger from './logger';
import { ApiRequest } from './types';

export interface RouteContext {
  userId: string;
  session: any;
  liveTeamId?: string;
}

export class InvalidInputError extends Error {
  meta?: any;
  constructor(msg: string, meta?: any) {
    super(msg);
    this.meta = meta;
  }
}

type RouteCb<T, R> = (
  params: Record<string, string>,
  body: T | undefined,
  context: RouteContext
) => Promise<R | void | undefined>;

export function registerRoute<T, R>(
  router: Router,
  method: 'get' | 'post' | 'put' | 'delete',
  route: string,
  cb: RouteCb<T, R>
) {
  logger.debug('Register route', method, route);
  router[method](route, async (req: ApiRequest, res: Response) => {
    try {
      const result = await cb({ ...req.params }, req.body, {
        userId: req.userId ?? '',
        session: req.session,
        liveTeamId: req.liveTeamId,
      });
      if (result) {
        const json = JSON.stringify(result);
        logger.debug('response=' + req.requestId, method, route, json);
        res.status(200).send(json);
      } else {
        logger.error(
          'Not Found Error',
          'req=' + req.requestId,
          method,
          route,
          'Not found.'
        );
        res.status(404).send(
          JSON.stringify({
            message: 'Not found.',
          })
        );
      }
    } catch (e) {
      if (e instanceof InvalidInputError) {
        logger.error(
          'Invalid Input Error',
          'req=' + req.requestId,
          method,
          route,
          e.stack
        );
        res.status(400).send(
          JSON.stringify({
            message: e.message,
          })
        );
      } else {
        logger.error(
          'Route Error',
          'req=' + req.requestId,
          method,
          route,
          String(e),
          e.stack
        );
        res.status(500).send(
          JSON.stringify({
            message: 'Internal server error.',
          })
        );
      }
    }
  });
}

export function registerGet<T, R>(
  router: Router,
  route: string,
  cb: RouteCb<T, R>
) {
  return registerRoute(router, 'get', route, cb);
}

export function registerPost<T, R>(
  router: Router,
  route: string,
  cb: RouteCb<T, R>
) {
  return registerRoute(router, 'post', route, cb);
}

export function registerPut<T, R>(
  router: Router,
  route: string,
  cb: RouteCb<T, R>
) {
  return registerRoute(router, 'put', route, cb);
}

export function registerDelete<T, R>(
  router: Router,
  route: string,
  cb: RouteCb<T, R>
) {
  return registerRoute(router, 'delete', route, cb);
}
