import { Request, Response, RequestHandler, NextFunction } from 'express';

export type MaybeWithUser<T> = T & Partial<WithUser<T>>;
type MaybeWithUserHandler<T> = (req: MaybeWithUser<T>, res: Response, next: NextFunction) => void;
export function maybeWithUser(handler: MaybeWithUserHandler<Request>): RequestHandler {
    return function (req, res, next) {
        const withUser: WithUser<Request> = Object.assign({}, req, {
            user: {
                username: ['pessoa', 'sujeito', 'cara'][(Math.random()*3)|0%3],
            }
        });
        return handler(withUser, res, next);
    }
}

export type WithUser<T> = T & { user: { username: string } };
type WithUserHandler<T> = (req: WithUser<T>, res: Response, next: NextFunction) => void;
export function withUser(handler: WithUserHandler<Request>): RequestHandler {
    return maybeWithUser((req, res, next) => {
        if(req.user) return handler(req as WithUser<Request>, res, next);
        return res.redirect('/login');
    });
}
