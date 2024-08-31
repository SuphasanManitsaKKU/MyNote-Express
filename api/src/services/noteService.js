const noteRepository = require('../repositories/noteRepository');

class NoteService {
  async create(noteData) {
    return noteRepository.createNote(noteData);
  }

  async getById(noteid) {
    return noteRepository.getNoteById(noteid);
  }

  async getAll(userid) {
    return noteRepository.getAllNotes(userid);
  }

  async update(noteid, noteData) {
    return noteRepository.updateNote(noteid, noteData);
  }

  async delete(noteid) {
    return noteRepository.deleteNoteById(noteid);
  }

  async getId() {
    return noteRepository.getNextId();
  }

  async getUserId() {
    return noteRepository.getNextUserId();
  }

  async createUserr(userdata,res) {
    return noteRepository.createUserrr(userdata,res);
  }

  async loginUser(userdata) {
    return noteRepository.loginUser(userdata);
  }

  async forgotPassword(email) {
    return noteRepository.forgotPassword(email);
  }
async changepassword(data) {
    return noteRepository.changepassword(data);
  }
}

module.exports = new NoteService();
