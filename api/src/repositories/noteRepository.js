const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ใช้ require สำหรับ CommonJS

class NoteRepository {
  async createNote(note) {
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
    const formattedDate = formatter.format(now);

    note.date = formattedDate;
    return prisma.note.create({ data: note });
  }

  async getNoteById(noteid) {
    return prisma.note.findUnique({ where: { noteid: Number(noteid) } });
  }

  async getAllNotes(userid) {
    const notes = await prisma.note.findMany({
      where: {
        userid: Number(userid),
      },
      orderBy: {
        noteid: 'asc', // หรือ 'desc' ขึ้นอยู่กับความต้องการ
      },
    });
    return notes;
  }

  async updateNote(noteid, updatedNote) {
    return prisma.note.update({
      where: { noteid: Number(noteid) },
      data: {
        title: updatedNote.title,
        content: updatedNote.content,
        color: updatedNote.color,
      },
    });
  }

  async deleteNoteById(noteid) {
    return prisma.note.delete({ where: { noteid: Number(noteid) } });
  }

  async getNextId() {
    // หา noteid ที่มากที่สุด
    const maxNote = await prisma.note.findFirst({
      orderBy: {
        noteid: 'desc',
      },
      select: {
        noteid: true,
      },
    });

    // ถ้าพบข้อมูล, เพิ่ม 1; ถ้าไม่พบ, ตั้งค่าเป็น 1
    const nextNoteId = maxNote ? maxNote.noteid + 1 : 1;
    return nextNoteId
  }

  async getNextUserId() {
    // หา noteid ที่มากที่สุด
    const maxUser = await prisma.user.findFirst({
      orderBy: {
        userid: 'desc',
      },
      select: {
        userid: true,
      },
    });

    // ถ้าพบข้อมูล, เพิ่ม 1; ถ้าไม่พบ, ตั้งค่าเป็น 1
    const nextUserId = maxUser ? maxUser.userid + 1 : 1;
    return nextUserId
  }

  async createUserrr(userdata, res) {
    const { userid, email, password } = userdata;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        userid: userid,
        email: email,
        password: hashedPassword,
      },
    });
    res.status(200).json(user);
  }

  async loginUser(userdata) {
    const { email, password } = userdata;

  if (!email || !password) {
    throw new Error('email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return token;

  }
}

module.exports = new NoteRepository();
