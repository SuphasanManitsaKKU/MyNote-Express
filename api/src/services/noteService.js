const noteRepository = require('../repositories/noteRepository');

class NoteService {
  async create(noteData) {
    return noteRepository.createNote(noteData);
  }

  async getById(noteid) {
    return noteRepository.getNoteById(noteid);
  }

  async getAll() {
    return noteRepository.getAllNotes();
  }

  async update(noteid, noteData) {
    return noteRepository.updateNote(noteid, noteData);
  }

  async delete(noteid) {
    return noteRepository.deleteNoteById(noteid);
  }
}

module.exports = new NoteService();
