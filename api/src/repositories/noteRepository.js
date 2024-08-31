const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ใช้ require สำหรับ CommonJS
const nodemailer = require("nodemailer");

async function sendEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // SMTP server for Gmail
    port: 465,
    secure: true, // Use `true` for port 465, `false` for other ports
    auth: {
      user: "suphasan.m@kkumail.com", // Your email address
      pass: "qbji nsrg mtoz skgz", // Your email password or app-specific password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: 'suphasan.m@kkumail.com', // Sender address
      to: `${email}`, // List of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // Plain text body
      html: `<b>Hello world? 3 <a href="https://www.suphasan.site/change_password/${token}">Click me</a></b>`, // HTML body
    });
    return 1;
  } catch (error) {
    return 0;
  }
}

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
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new Error('Invalid email or password');
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่ในฐานข้อมูล
    const user = await prisma.user.create({
      data: {
        userid: userid,
        email: email,
        password: hashedPassword,
      },
    });

    // ส่ง response กลับไปพร้อมข้อมูลของผู้ใช้ใหม่
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

  async forgotPassword(userdata) {
    const { email } = userdata;

    if (!email) {
      throw new Error('email are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email');
    }

    const token = jwt.sign({ userId: user.userid }, process.env.JWT_SECRET_CHANGE_PASSWORD, { expiresIn: '1h' });

    // -----------------------------------------------------------------------------------------------------------------------------
    const response = await sendEmail(user.email, token);
    if (response === 0) {
      throw new Error('Email not sent');
    }
    return "success";
  }

  async changepassword(userdata) {
    const { token, password, confirmPassword } = userdata;
    console.log(token);
    console.log(password);
    console.log(confirmPassword);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // ตรวจสอบและถอดรหัสโทเค็น
      const decoded = jwt.verify(token, process.env.JWT_SECRET_CHANGE_PASSWORD);
      const userId = decoded.userId;

      console.log(userId, "userId");

      // ค้นหาผู้ใช้จาก userId
      const user = await prisma.user.findUnique({
        where: { userid: userId }, // สมมติว่าในฐานข้อมูลใช้ 'id' เป็นคีย์หลัก
      });

      if (!user) {
        throw new Error("User not found");
      }

      // เปลี่ยนรหัสผ่าน
      await prisma.user.update({
        where: { userid: userId },
        data: {
          password: await bcrypt.hash(password, 10), // ใช้ bcrypt ในการเข้ารหัสรหัสผ่านใหม่
        },
      });
    }
    catch (error) {
      throw new Error("Invalid token");
    }

    return "Password changed successfully";
  }

}

module.exports = new NoteRepository();
