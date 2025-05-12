import path from 'path';
import { cwd } from 'process';
import fs from 'node:fs';

import {
    getSingleFile,
    getAllFiles,
    insertFile,
    deleteFile
} from './migrations.js';

export interface FileData {
    id: number;
    original_name: string;
    stored_name: string;
    username: string;
    uploaded_at: string;
}

export class File {
    id: number;
    original_name: string;
    stored_name: string;
    username: string;
    uploaded_at: string;

    constructor(file: FileData) {
        this.id = file.id;
        this.original_name = file.original_name;
        this.stored_name = file.stored_name;
        this.username = file.username;
        this.uploaded_at = file.uploaded_at;
    }

    static parse(file: any): File {
        if (!file) throw new Error('File not found');
        if (!(typeof file === 'object' && 'id' in file && 'original_name' in file && 
              'stored_name' in file && 'username' in file && 'uploaded_at' in file))
            throw new Error('Invalid file data');
        return new File(file);
    }

    static get(id: string): File {
        const file = getSingleFile.get(id);
        return File.parse(file);
    }

    static getAll(username: string): File[] {
        const files = getAllFiles.all(username);
        return files.map((file) => File.parse(file));
    }

    static create(original_name: string, stored_name: string, username: string): File {
        const r = insertFile.run({ original_name, stored_name, username });
        const id = r.lastInsertRowid;
        if (typeof id === 'bigint') throw new Error('Too many files');
        return new File({
            id: Number(id),
            original_name,
            stored_name,
            username,
            uploaded_at: new Date().toISOString()
        });
    }

    delete(): void {
        const filepath = path.join(cwd(), 'uploads', this.stored_name);
        fs.unlinkSync(filepath);
        deleteFile.run(this.id);
    }

    getFileType(): string {
        const ext = path.extname(this.original_name).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext)) return 'image';
        if (ext === '.pdf') return 'pdf';
        if (['.txt', '.md', '.csv'].includes(ext)) return 'text';
        if (['.mp4', '.webm'].includes(ext)) return 'video';
        if (['.mp3', '.wav'].includes(ext)) return 'audio';
        return 'other';
    }

    getViewData() {
        const ext = path.extname(this.original_name).toLowerCase();
        if (['.txt', '.md', '.csv'].includes(ext)){
            
            const filepath = path.join(cwd(), 'uploads', this.stored_name);

            return {
                id: this.id,
                original_name: this.original_name,
                type: this.getFileType(),
                content: fs.readFileSync(filepath, 'utf8')
            };
        }else{
            return {
                id: this.id,
                original_name: this.original_name,
                type: this.getFileType(),
                content: ''
            };
        }
    }

    getPreviewData() {
        return {
            type: this.getFileType()
        };
    }

}