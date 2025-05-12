import { Request, Response, RequestHandler, NextFunction, Router } from 'express';
import bcrypt from 'bcrypt';
import db from './db';

// --------------------
// Types & Middleware
// --------------------

export type WithUser<T> = T & { user: { username: string } };
export type MaybeWithUser<T> = T & Partial<WithUser<T>>;

type MaybeWithUserHandler<T> = (req: MaybeWithUser<T>, res: Response, next: NextFunction) => void;
type WithUserHandler<T> = (req: WithUser<T>, res: Response, next: NextFunction) => void;

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Adiciona user se autenticado
export function maybeWithUser(handler: MaybeWithUserHandler<Request>): RequestHandler {
  return function (req, res, next) {
    if (req.session.userId) {
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.session.userId);
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
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    req.session.userId = user.id;

    res.render('partials/auth-success', { message: 'Registrado com sucesso!' });
  } catch (e) {
    res.render('partials/auth-error', { message: 'Usuário já existe.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (user && bcrypt.compareSync(password, user.password_hash)) {
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
