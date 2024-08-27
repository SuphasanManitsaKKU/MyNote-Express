const prisma = require('../prisma/client');

class NoteRepository {
  async createNote(note) {
    return prisma.note.create({ data: note });
  }

  async getNoteById(noteid) {
    return prisma.note.findUnique({ where: { noteid: Number(noteid) } });
  }

  async getAllNotes() {
    console.log("getAllNotes");
    return prisma.note.findMany();
  }

  async updateNote(noteid, updatedNote) {
    return prisma.note.update({
      where: { noteid: Number(noteid) },
      data: updatedNote,
    });
  }

  async deleteNoteById(noteid) {
    return prisma.note.delete({ where: { noteid: Number(noteid) } });
  }
}

module.exports = new NoteRepository();
