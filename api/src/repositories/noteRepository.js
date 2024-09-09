const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ใช้ require สำหรับ CommonJS
const nodemailer = require("nodemailer");
const { ObjectId } = require('mongodb');

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
      subject: "Change Password", // Subject line
      text: "Change Password?", // Plain text body
      html: `<b>Change Password Click => <a href="https://www.suphasan.site/change_password/${token}">Click me</a></b>`, // HTML body
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

    note.noteId = new ObjectId();
    note.date = formattedDate;

    return prisma.note.create({ data: note });
  }

  async getNoteById(noteId) {
    return prisma.note.findUnique({ where: { noteId: noteId } });
  }

  async getAllNotes(userId) {
    try {
      const notes = await prisma.note.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          noteId: 'asc', // หรือ 'desc' ขึ้นอยู่กับความต้องการ
        },
      });
      return notes;
    } catch (error) {
      return "error"
    }


  }

  async updateNote(noteId, updatedNote) {
    return prisma.note.update({
      where: { noteId: noteId },
      data: {
        title: updatedNote.title,
        content: updatedNote.content,
        color: updatedNote.color,
      },
    });
  }

  async deleteNoteById(noteId) {
    return prisma.note.delete({ where: { noteId: noteId } });
  }

  async createUserrr(userdata, res) {
    const { email, password } = userdata;

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
        userId: new ObjectId(),  // กำหนดให้ userId เป็น ObjectId เดียวกับ id
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

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_CHANGE_PASSWORD, { expiresIn: '1h' });

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
        where: { userId: userId }, // สมมติว่าในฐานข้อมูลใช้ 'id' เป็นคีย์หลัก
      });

      if (!user) {
        throw new Error("User not found");
      }

      // เปลี่ยนรหัสผ่าน
      await prisma.user.update({
        where: { userId: userId },
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
