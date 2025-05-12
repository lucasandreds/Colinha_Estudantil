import path from "path";
import hbs from "hbs";
import bodyParser from "body-parser";
import { cwd } from "process";
import { getAllExercises, getAllFiles } from "./migrations";
import { Exercise, parseExerciseFromRequest } from "./exercises";
import { maybeWithUser, withUser } from "./autenticacao";
import { File } from "./file";
import multer from "multer";
import fs from "node:fs";
import { Note } from "./notes";
import authRouter from "./autenticacao";


import express from "express";
import session from "express-session";
import FileStore from "session-file-store";

const FileStoreSession = FileStore(session);

const app = express();
const port = 24627;

app.use(
  session({
    store: new FileStoreSession({ path: './sessions' }), // Pasta onde as sessões serão armazenadas
    secret: process.env.SESSION_SECRET || "alga-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }, // 2 horas
  })
);



app.set("views", path.join(cwd(), "views"));
app.set("view engine", "hbs");

app.use(bodyParser.urlencoded({ extended: true }));

hbs.registerPartials(path.join(cwd(), "/views/layouts"));
hbs.registerPartials(path.join(cwd(), "/views/partials"));
hbs.registerHelper("inc", (i) => +i + 1);
hbs.registerHelper("eq", (a, b) => a === b);


app.get(
  "/",
  withUser((req, res) => {
    const username = req.user.username;
    const exercises = getAllExercises.all(req.user?.username);
    const files = getAllFiles.all(username);
    res.render("index", {
      username: req.user?.username,
      exercises,
      files,
    });
  })
);

const upload = multer({ dest: "uploads/" });

// Rotas de autenticação (login, register, logout)
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// POST /login, /register, /logout já são tratados no router autenticacao.ts
app.use(authRouter);


app.get(
  "/arquivos",
  withUser((req, res) => {
    const files = getAllFiles.all(req.user.username);
    res.render("tabs/tabFiles", { files });
  })
);

app.get(
  "/exercicios",
  withUser((req, res) => {
    const exercises = getAllExercises.all(req.user.username);
    res.render("tabs/tabExercises", { exercises });
  })
);

app.get(
  "/anotacoes",
  withUser((req, res) => {
    const notes = Note.getAll(req.user.username);
    res.render("tabs/tabNotes", { notes });
  })
);

app.post(
  "/archive/upload",
  upload.single("file"),
  withUser((req, res) => {
    const username = req.user.username;
    const file = req.file;
    if (!file) return res.status(400).send("Nenhum arquivo enviado.");
    const fileName = Buffer.from(file.originalname, "latin1").toString("utf8");

    const newFile = File.create(fileName, file.filename, username);
    res.render("partials/file", { ...newFile });
  })
);

app.get(
  "/archive/files/:id",
  withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send("Arquivo não encontrado");
    const filepath = path.join(cwd(), "uploads", file.stored_name);
    res.download(filepath, file.original_name);
  })
);

app.delete(
  "/archive/delete/:id",
  withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send("Arquivo não encontrado");
    file.delete();
    res.send("");
  })
);

app.get(
  "/archive/preview/:id",
  withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send("Arquivo não encontrado");
    res.render("partials/file-preview", file.getPreviewData());
  })
);

app.get(
  "/archive/view/:id",
  withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send("Arquivo não encontrado");
    res.render("partials/file-view", file.getViewData());
  })
);

app.post(
  "/archive/save/:id",
  express.urlencoded({ extended: true }),
  withUser((req, res) => {
    const file = File.get(req.params.id);
    if (!file) return res.status(404).send("Arquivo não encontrado");

    const ext = path.extname(file.original_name).toLowerCase();
    if (![".txt", ".md", ".csv"].includes(ext))
      return res.status(400).send("Formato não editável.");

    const filepath = path.join(cwd(), "uploads", file.stored_name);
    fs.writeFileSync(filepath, req.body.content, "utf8");

    res.render("partials/save-success");
  })
);

app.get(
  "/exercise/new",
  withUser((req, res) => {
    res.render("exercise-new", { username: req.user?.username });
  })
);
app.post(
  "/exercise",
  withUser((req, res) => {
    const exercise = Exercise.create(parseExerciseFromRequest(req));
    res.header("HX-Redirect", "/exercise/" + exercise.rowid).send();
  })
);

app.get(
  "/exercise/:id",
  withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if (!exercise) return res.status(404).send("Exercise not found");
    res.render("exercise", { username: req.user?.username, ...exercise });
  })
);
app.post(
  "/exercise/:id/result",
  withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if (!exercise) return res.status(404).send("Exercise not found");
    const results = exercise.parseResult(req.body);
    res.render("partials/exercise-result", {
      username: req.user.username,
      exercise,
      results,
    });
  })
);

app.delete(
  "/exercise/:id",
  withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if (!exercise) return res.status(404).send("Exercise not found");
    exercise.delete();
    res.header("HX-Redirect", "/").send();
  })
);

app.get(
  "/exercise/:id/edit",
  withUser((req, res) => {
    const exercise = Exercise.get(req.params.id);
    if (!exercise) return res.status(404).send("Exercise not found");
    res.render("exercise-edit", { username: req.user?.username, ...exercise });
  })
);

app.put(
  "/notes/:id",
  withUser((req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).render("partials/edit-note-error");
    try {
      const note = Note.get(id);
      if (!note) return res.status(404).render("partials/edit-note-error");
      note.update({ title, content });
      res.render("partials/edit-note-success");
    } catch (e) {
      res.status(500).render("partials/edit-note-error");
    }
  })
);

app.post(
  "/notes",
  withUser((req, res) => {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).render("partials/create-note-error");
    try {
      Note.create({ title, content, username: req.user.username });
      res.render("partials/create-note-success");
    } catch (e) {
      res.status(500).render("partials/create-note-error");
    }
  })
);

app.get(
  "/notes/:id/edit",
  withUser((req, res) => {
    const note = Note.get(req.params.id);
    if (!note) return res.status(404).render("partials/edit-note-error");
    res.render("note-edit", { note, username: req.user?.username });
  })
);

app.delete(
  "/notes/:id",
  withUser((req, res) => {
    try {
      const { id } = req.params;
      const note = Note.get(id);
      if (!note) return res.status(404).render("partials/delete-note-error");
      note.delete();
      res.render("partials/delete-note-success");
    } catch (e) {
      res.status(500).render("partials/delete-note-error");
    }
  })
);

app.get(
  "/notes/new",
  withUser((req, res) => {
    res.render("note-new", { username: req.user?.username });
  })
);

// Static files
app.use(express.static(path.join(cwd(), "dist")));
app.use("/icons", express.static(path.join(process.cwd(), "icons")));

// 404 Handler
app.use(
  maybeWithUser((req, res, next) => {
    res.status(404).render("404", { username: req.user?.username });
  })
);

app.listen(port, () => {
  console.log("Listening on", "http://localhost:" + port);
});