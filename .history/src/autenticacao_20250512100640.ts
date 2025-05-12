import { Request, Response, RequestHandler, NextFunction, Router } from 'express';
import bcrypt from 'bcrypt';
import db from './db';
import Database from 'better-sqlite3';


// --------------------
// Types & Middleware
// --------------------
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}



export type WithUser<T> = T & { user: { username: string } };
export type MaybeWithUser<T> = T & Partial<WithUser<T>>;

type MaybeWithUserHandler<T> = (req: MaybeWithUser<T>, res: Response, next: NextFunction) => void;
type WithUserHandler<T> = (req: WithUser<T>, res: Response, next: NextFunction) => void;

// Adiciona user se autenticado (simulado/random no exemplo)
export function maybeWithUser(handler: MaybeWithUserHandler<Request>): RequestHandler {
  return async function (req, res, next) {
    if (req.session.userId) {
      const user = await db.get('SELECT username FROM users WHERE id = ?', req.session.userId);
      if (user) {
        const withUser: WithUser<Request> = Object.assign({}, req, {
          user: { username: user.username },
        });
        return handler(withUser, res, next);
      }
    }
    return handler(req, res, next);
  };
}


// Middleware real: só chama handler se req.user existir, senão redireciona
export function withUser(handler: WithUserHandler<Request>): RequestHandler {
  return maybeWithUser((req, res, next) => {
    if (req.user) return handler(req as WithUser<Request>, res, next);
    return res.redirect('/login');
  });
}

// --------------------
// Auth Routes (Register, Login, Logout)
// --------------------

const router = Router();

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', username, hash);
    const user = await db.get('SELECT id FROM users WHERE username = ?', username);
    req.session.userId = user.id;

    res.render('partials/auth-success', { message: 'Registrado com sucesso!' });
  } catch (e) {
    res.render('partials/auth-error', { message: 'Usuário já existe.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);

  if (user && await bcrypt.compare(password, user.password_hash)) {
    req.session.userId = user.id;
    return res.render('partials/auth-success', { message: 'Login bem-sucedido!' });
  }

  res.render('partials/auth-error', { message: 'Credenciais inválidas.' });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

export default router;
