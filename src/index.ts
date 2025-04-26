import express from 'express'
import { Request } from 'express'
import path from 'path'
import hbs from 'hbs'
import { cwd } from 'process';

await import('./migrations');

const app = express();
// Uma porta aleatória para evitar conflitos
const port = 24626;

app.set('views', path.join(cwd(), 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(cwd(), '/views/layouts'));
hbs.registerPartials(path.join(cwd(), '/views/partials'));

export interface AuthenticatedRequest extends Request {
    user?: {
        username: string
    }
}

app.use((req: AuthenticatedRequest, res, next) => {
    req.user = {
        username: ['pessoa', 'sujeito', 'cara'][(Math.random()*3)|0%3],
    };
    next();
})

app.get('/', (req: AuthenticatedRequest, res) => {
    res.render('index', { username: req.user?.username })
})

app.use(express.static(path.join(cwd(), 'dist')));

app.use((req: AuthenticatedRequest, res, next) => {
    res.status(404).render('404', { username: req.user?.username });
});

app.listen(port, () => {
    console.log('Listening on', 'http://localhost:' + port);
})
