import express from 'express'
import path from 'path'
import hbs from 'hbs'
import bodyParser from 'body-parser';
import { cwd } from 'process';
import { getAllExercises } from './migrations';
import { Exercise, parseExerciseFromRequest } from './exercises';

await import('./migrations');

const app = express();
// Uma porta aleatória para evitar conflitos
const port = 24626;

app.set('views', path.join(cwd(), 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));

hbs.registerPartials(path.join(cwd(), '/views/layouts'));
hbs.registerPartials(path.join(cwd(), '/views/partials'));
hbs.registerHelper('inc', (i) => +i + 1);

export type MaybeWithUser<T> = T & Partial<WithUser<T>>;
type MaybeWithUserHandler<T> = (req: MaybeWithUser<T>, res: express.Response, next: express.NextFunction) => void;
function maybeWithUser(handler: MaybeWithUserHandler<express.Request>): express.RequestHandler {
    return function (req, res, next) {
        const withUser: WithUser<express.Request> = Object.assign({}, req, {
            user: {
                username: ['pessoa', 'sujeito', 'cara'][(Math.random()*3)|0%3],
            }
        });
        return handler(withUser, res, next);
    }
}

export type WithUser<T> = T & { user: { username: string } };
type WithUserHandler<T> = (req: WithUser<T>, res: express.Response, next: express.NextFunction) => void;
function withUser(handler: WithUserHandler<express.Request>): express.RequestHandler {
    return maybeWithUser((req, res, next) => {
        if(req.user) return handler(req as WithUser<express.Request>, res, next);
        return res.redirect('/login');
    });
}

app.get('/', withUser((req, res) => {
    const exercises = getAllExercises.all(req.user?.username);
    res.render('index', {
        username: req.user?.username,
        exercises,
    });
}))

app.get('/exercise/new', withUser((req, res) => {
    res.render('exercise-new', { username: req.user?.username });
}))
app.post('/exercise', withUser((req, res) => {
    const exercise = Exercise.create(parseExerciseFromRequest(req));
    res.header('HX-Redirect', '/exercise/' + exercise.rowid).send();
}))

app.get('/exercise/:id', withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if(!exercise) return res.status(404).send('Exercise not found');
    res.render('exercise', { username: req.user?.username, ...exercise });
}))
app.post('/exercise/:id/result', withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if(!exercise) return res.status(404).send('Exercise not found');
    console.info(req.body);
    const results = exercise.parseResult(req.body);
    res.render('partials/exercise-result', {
        username: req.user.username,
        exercise,
        results,
    })

}))

app.delete('/exercise/:id', withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if(!exercise) return res.status(404).send('Exercise not found');
    exercise.delete();
    res.header('HX-Redirect', '/').send();
}))

app.get('/exercise/:id/edit', withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if(!exercise) return res.status(404).send('Exercise not found');
    res.render('exercise-edit', { username: req.user?.username, ...exercise });
}))
app.put('/exercise/:id', withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if(!exercise) return res.status(404).send('Exercise not found');
    exercise.update(parseExerciseFromRequest(req));
    res.header('HX-Redirect', '/exercise/' + exercise.rowid).send();
}))

app.use(express.static(path.join(cwd(), 'dist')));

app.use(maybeWithUser((req, res, next) => {
    res.status(404).render('404', { username: req.user?.username });
}));

app.listen(port, () => {
    console.log('Listening on', 'http://localhost:' + port);
})
