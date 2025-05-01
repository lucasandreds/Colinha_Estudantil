import path from 'path'
import { cwd } from 'process';
import multer from 'multer';
import fs from 'node:fs';
import { AuthenticatedRequest } from './autenticacao';

const upload = multer({ dest: 'uploads/' });

function files(db,app) {

    app.post('/upload', upload.single('file'), (req: AuthenticatedRequest, res) => {
        const username = req.user?.username;
        const file = req.file;
        if (!file) return res.status(400).send('Nenhum arquivo enviado.');
    
        db.prepare(`INSERT INTO files (original_name, stored_name, username)VALUES (?, ?, ?)`).run(file.originalname, file.filename, username);
    
        const fileData = db.prepare(`SELECT * FROM files WHERE username = ? ORDER BY uploaded_at DESC LIMIT 1`).get(username);
        
        res.render('layouts/file', fileData);
    });
    
    app.get('/files/:filename', (req, res) => {
        const filepath = path.join(cwd(), 'uploads', req.params.filename);
        res.download(filepath);
    });

    app.delete('/delete/:id', (req, res) => {
        const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
        if (!file) return res.status(404).send('Arquivo não encontrado');

        const filepath = path.join(cwd(), 'uploads', file.stored_name);
        fs.unlinkSync(filepath);

        db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id);

        res.send('');
    });
}

export default files;