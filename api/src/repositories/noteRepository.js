const prisma = require('../prisma/client');
const { ObjectId } = require('mongodb');

class NoteRepository {
  async createNote(title, content, color, userId) {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const date = formatter.format(now);
    const noteId = new ObjectId();

    const note = {
      noteId: noteId,
      title: title,
      content: content,
      color: color,
      userId: userId,
      date: date,
    };

    const createdNote = await prisma.note.create({
      data: note
    });

    return createdNote;
  }

  async getNoteByUserId(userId) {
    return prisma.note.findMany({ where: { userId: userId }
    });
  }

  async getAllNotes(userId) {
    return await prisma.note.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        noteId: 'asc',
      },
    });
  }

  async updateNote(noteId, title, content, color) {
    return prisma.note.update({
      where: { noteId: noteId },
      data: {
        title: title,
        content: content,
        color: color,
      },
    });
  }

  async deleteNoteById(noteId) {
    return prisma.note.delete({ where: { noteId: noteId } });
  }

  async createUser(email, password) {
    const user = await prisma.user.create({
      data: {
        userId: new ObjectId(),  // กำหนดให้ userId เป็น ObjectId เดียวกับ id
        email: email,
        password: password,
      },
    });
    // ส่ง response กลับไปพร้อมข้อมูลของผู้ใช้ใหม่
    return user;
  }

  async loginUser(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user;

  }

  async changepassword(userId, password) {
    await prisma.user.update({
      where: { userId: userId },
      data: {
        password: password,
      },
    });
    return "Password changed successfully";
  }

  async getUserByEmail(email) {
    return prisma.user.findUnique({ where: { email: email } });
  }

  async getUserById(userId) {
    return prisma.user.findUnique({ where: { userId: userId } });
  }
}

module.exports = new NoteRepository();
