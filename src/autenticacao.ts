import { Request, Response, RequestHandler, NextFunction, Router } from 'express';
import bcrypt from 'bcrypt';
import db from './db';

// User Model Type Definition
interface User {
  id: number;
  username: string;
  password_hash: string;
}

// Extended type declarations
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { 
        id?: number;
        username: string 
      };
    }
  }
}

// Utility Types
export type RequestWithOptionalUser = Request & { user?: { username: string } };
export type RequestWithUser = Request & { user: { username: string } };

// Authentication Middleware
export function maybeWithUser(handler: (req: RequestWithOptionalUser, res: Response, next: NextFunction) => void): RequestHandler {
  return function(req, res, next) {
    // Check if user is authenticated
    if (req.session.userId) {
      // Type assertion for the database query
      const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.session.userId) as User | undefined;
      
      if (user) {
        // Attach user to request if found
        req.user = { 
          id: user.id,
          username: user.username 
        };
      }
    }
    
    // Call the original handler
    return handler(req, res, next);
  };
}

// Middleware to ensure user is authenticated
export function withUser(handler: (req: RequestWithUser, res: Response, next: NextFunction) => void): RequestHandler {
  return maybeWithUser((req, res, next) => {
      if(req.user) return handler(req as RequestWithUser, res, next);
      return res.redirect('/login');
  });
}

// Authentication Routes
const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).render('register', { 
      error: 'Usuário e senha são obrigatórios' 
    });
  }

  try {
    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    
    if (existingUser) {
      return res.status(400).render('register', { 
        error: 'Usuário já existe' 
      });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    
    // Get the newly created user's ID
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    
    if (!user) {
      throw new Error('User not found after registration');
    }

    // Set session
    req.session.userId = user.id;

    // Redirect to index page after successful registration
    res.setHeader('HX-Redirect', '/');
    res.status(200).send();
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).render('register', { 
      error: 'Erro no registro. Por favor, tente novamente.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).render('login', {
      error: 'Usuário e senha são obrigatórios'
    });
  }

  try {
    // Find user by username
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

    // Verify password
    if (user && await bcrypt.compare(password, user.password_hash)) {
      // Set session
      req.session.userId = user.id;
      
      // Successful login redirect
      return res.redirect('/');
    }
    res.status(401).render('login', {
      error: 'Usuário ou senha inválidos'
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).render('login', {
      error: 'Erro interno do servidor. Tente novamente mais tarde.'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Erro ao fazer logout');
    }
    res.redirect('/login');
  });
});

export default router;