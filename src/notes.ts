import {
  getSingleNote,
  getAllNotes,
  insertNote,
  updateNote,
  deleteNote,
} from "./migrations";

export interface NoteData {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export class Note {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  updated_at: string;

  constructor(note: NoteData) {
    this.id = note.id;
    this.title = note.title;
    this.content = note.content;
    this.username = note.username;
    this.created_at = note.created_at;
    this.updated_at = note.updated_at;
  }

  static parse(note: any): Note {
    if (!note) throw new Error("Note not found");
    if (
      !(
        typeof note === "object" &&
        "id" in note &&
        "title" in note &&
        "content" in note &&
        "username" in note &&
        "created_at" in note &&
        "updated_at" in note
      )
    )
      throw new Error("Invalid note data");
    return new Note(note);
  }

  static get(id: string): Note {
    const note = getSingleNote.get(id);
    return Note.parse(note);
  }

  static getAll(username: string): Note[] {
    const notes = getAllNotes.all(username);
    return notes.map((note) => Note.parse(note));
  }

  static create(
    data: Omit<NoteData, "id" | "created_at" | "updated_at">
  ): Note {
    const { title, content, username } = data;
    const r = insertNote.run({ title, content, username });
    const id = r.lastInsertRowid;
    if (typeof id === "bigint") throw new Error("Too many notes");
    return new Note({
      id: Number(id),
      title,
      content,
      username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  update(
    data: Partial<Omit<NoteData, "id" | "username" | "created_at">>
  ): void {
    if (data.title) this.title = data.title;
    if (data.content) this.content = data.content;
    this.updated_at = new Date().toISOString();
    updateNote.run({
      id: this.id,
      title: this.title,
      content: this.content,
      updated_at: this.updated_at,
    });
  }

  delete(): void {
    deleteNote.run(this.id);
  }
}
