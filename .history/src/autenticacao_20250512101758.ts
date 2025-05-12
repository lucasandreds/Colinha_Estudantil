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
type RequestWithOptionalUser = Request & { user?: { username: string } };
type RequestWithUser = Request & { user: { username: string } };

// Authentication Middleware
export function maybeWithUser(handler: (req: RequestWithOptionalUser, res: Response, next: NextFunction) => void): RequestHandler {
  return async function(req, res, next) {
    try {
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
    } catch (error) {
      // Handle any potential errors
      next(error);
    }
  };
}

// Middleware to ensure user is authenticated
export function withUser(handler: (req: RequestWithUser, res: Response, next: NextFunction) => void): RequestHandler {
  return maybeWithUser((req, res, next) => {
    // If user is not authenticated, redirect to login
    if (!req.user) {
      return res.redirect('/login');
    }
    
    // Cast req to RequestWithUser and call handler
    return handler(req as RequestWithUser, res, next);
  });
}

// Authentication Routes
const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    
    // Get the newly created user's ID
    // Type assertion for the database query
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as { id: number } | undefined;
    
    if (!user) {
      throw new Error('User not found after registration');
    }

    // Set session
    req.session.userId = user.id;

    res.render('partials/auth-success', { message: 'Registrado com sucesso!' });
  } catch (e) {
    // Handle potential duplicate username or other errors
    res.status(400).render('partials/auth-error', { 
      message: 'Erro no registro. Usuário pode já existir.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    // Type assertion for the database query
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

    // Verify password
    if (user && await bcrypt.compare(password, user.password_hash)) {
      // Set session
      req.session.userId = user.id;
      
      return res.render('partials/auth-success', { message: 'Login bem-sucedido!' });
    }

    // Invalid credentials
    res.status(401).render('partials/auth-error', { message: 'Credenciais inválidas.' });
  } catch (e) {
    // Handle any unexpected errors
    res.status(500).render('partials/auth-error', { message: 'Erro interno do servidor.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Erro ao fazer logout');
    }
    res.redirect('/');
  });
});

export default router;