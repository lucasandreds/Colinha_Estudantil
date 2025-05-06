import path from 'path'
import { cwd } from 'process';
import multer from 'multer';
import fs from 'node:fs';
import { withUser } from './autenticacao';

const upload = multer({ dest: 'uploads/' });

function files(db,app) {

    app.post('/upload', upload.single('file'), withUser((req, res) => {
        const username = req.user.username;
        const file = req.file;
        if (!file) return res.status(400).send('Nenhum arquivo enviado.');
        const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
        db.prepare(` INSERT INTO files (original_name, stored_name, username) VALUES (?, ?, ?)`).run(fileName, file.filename, username);
    
        const fileData = db.prepare(`SELECT * FROM files WHERE username = ? ORDER BY uploaded_at DESC LIMIT 1`).get(username);
        
        res.render('layouts/file', fileData);
    }))
    
    app.get('/files/:id', withUser((req, res) => {
        const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
        if (!file) return res.status(404).send('Arquivo não encontrado');
    
        const filepath = path.join(cwd(), 'uploads', file.stored_name);
        
        res.download(filepath, file.original_name);
    }));
    

    app.delete('/delete/:id', withUser((req, res) => {
        const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
        if (!file) return res.status(404).send('Arquivo não encontrado');

        const filepath = path.join(cwd(), 'uploads', file.stored_name);
        fs.unlinkSync(filepath);

        db.prepare('DELETE FROM files WHERE id = ?').run(req.params.id);

        res.send('');
    }));

    app.get('/preview/:id', withUser((req, res) => {
        const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.id);
        if (!file) return res.status(404).send('Arquivo não encontrado');
    
        const ext = path.extname(file.original_name).toLowerCase();
    
        const fileUrl = `/files/${file.stored_name}`;
        let previewHtml = '';
    
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext)) {
            previewHtml = `<img src="/icons/image.png" alt="Ícone PDF" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        } else if (ext === '.pdf') {
            previewHtml = `<img src="/icons/pdf.png" alt="Ícone PDF" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        } else if (['.txt', '.md', '.csv'].includes(ext)) {
            previewHtml = `<img src="/icons/text.png" alt="Ícone TEXT" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        } else if (['.mp4', '.webm'].includes(ext)) {
            previewHtml = `<img src="/icons/video.png" alt="Ícone vídeo" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        } else if (['.mp3', '.wav'].includes(ext)) {
            previewHtml = `<img src="/icons/audio.png" alt="Ícone áudio" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        } else {
            previewHtml = `<img src="/icons/blank.png" alt="Ícone genérico" style="width: 100%; height: 100%; object-fit: contain;" class="rounded shadow"">`;
        }
    
        res.send(previewHtml);
    }));
}

export default files;