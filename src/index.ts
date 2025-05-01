import express from 'express'
import path from 'path'
import hbs from 'hbs'
import { cwd } from 'process';
import files from './file';
import db from './migrations';
import { AuthenticatedRequest } from './autenticacao';

const app = express();
// Uma porta aleatória para evitar conflitos
const port = 24626;

app.set('views', path.join(cwd(), 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(cwd(), '/views/layouts'));
hbs.registerPartials(path.join(cwd(), '/views/partials'));

app.use((req: AuthenticatedRequest, res, next) => {
    req.user = {
        username: ['pessoa', 'sujeito', 'cara'][(Math.random()*3)|0%3],
    };
    next();
})

app.get('/', (req: AuthenticatedRequest, res) => {
    const username = req.user?.username
    const files = db.prepare('SELECT * FROM files WHERE username = ? ORDER BY uploaded_at DESC').all(username);
    res.render('index', {
        username: req.user?.username,
        files
    });
});

files(db,app);

app.use(express.static(path.join(cwd(), 'dist')));

app.use((req: AuthenticatedRequest, res, next) => {
    res.status(404).render('404', { username: req.user?.username });
});

app.listen(port, () => {
    console.log('Listening on', 'http://localhost:' + port);
})