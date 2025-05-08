import express from 'express'
import path from 'path'
import hbs from 'hbs'
import bodyParser from 'body-parser';
import { cwd } from 'process';
import { getAllExercises, getAllFiles } from './migrations';
import { Exercise, parseExerciseFromRequest } from './exercises';
import { maybeWithUser, withUser } from './autenticacao';
import { File } from './file';
import multer from 'multer';
import fs from 'node:fs';

fs.mkdirSync('uploads', { recursive: true })

const app = express();
// Uma porta aleatória para evitar conflitos
const port = 24626;

app.set('views', path.join(cwd(), 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: true }));

hbs.registerPartials(path.join(cwd(), '/views/layouts'));
hbs.registerPartials(path.join(cwd(), '/views/partials'));
hbs.registerHelper('inc', (i) => +i + 1);
hbs.registerHelper('eq', (a, b) => {return a === b;});

app.get('/', withUser((req, res) => {
    const username = req.user.username;
    const exercises = getAllExercises.all(req.user?.username);
    const files = getAllFiles.all(username);
    res.render('index', {
        username: req.user?.username,
        exercises,
        files
    });
}))

const upload = multer({ dest: 'uploads/' });;

app.post('/archive/upload', upload.single('file'), withUser((req, res) => {
    const username = req.user.username;
    const file = req.file;
    if (!file) return res.status(400).send('Nenhum arquivo enviado.');
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    const newFile = File.create(fileName, file.filename, username);
    res.render('partials/file', { ...newFile });
}));

app.get('/archive/files/:id', withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send('Arquivo não encontrado');
    const filepath = path.join(cwd(), 'uploads', file.stored_name);
    res.download(filepath, file.original_name);
}));

app.delete('/archive/delete/:id', withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send('Arquivo não encontrado');
    file.delete();
    res.send('');
}));

app.get('/archive/preview/:id', withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send('Arquivo não encontrado');
    res.render('partials/file-preview', file.getPreviewData());
}));

app.get('/archive/view/:id', withUser((req, res) =>{
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send('Arquivo não encontrado');
    res.render('partials/file-view', file.getViewData());
}));

app.post('/archive/save/:id', express.urlencoded({ extended: true }), withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send('Arquivo não encontrado');

    const ext = path.extname(file.original_name).toLowerCase();
    if (!['.txt', '.md', '.csv'].includes(ext)) return res.status(400).send('Formato não editável.');

    const filepath = path.join(cwd(), 'uploads', file.stored_name);
    fs.writeFileSync(filepath, req.body.content, 'utf8');

    res.render('partials/save-success');
}));

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
app.use('/icons', express.static(path.join(process.cwd(), 'icons')));

app.use(maybeWithUser((req, res, next) => {
    res.status(404).render('404', { username: req.user?.username });
}));

app.listen(port, () => {
    console.log('Listening on', 'http://localhost:' + port);
})