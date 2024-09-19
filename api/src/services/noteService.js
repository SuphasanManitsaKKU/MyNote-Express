const bcrypt = require('bcrypt');
const noteRepository = require('../repositories/noteRepository');
const jwt = require('jsonwebtoken'); // ใช้ require สำหรับ CommonJS
const sendEmail = require('../utils/sendEmail');

class NoteService {
  async createNote(title,content,color,userId) {
    const note = await noteRepository.createNote(title,content,color,userId);

    if (!note) {
      throw new Error('Failed to create note');
    }
    return note
  }

  async getById(noteid) {
    return noteRepository.getNoteById(noteid);
  }

  async getAll(userId) {
    const notes = await noteRepository.getAllNotes(userId);

    if (!notes) {
      throw new Error('No notes found');
    }

    return notes;
  }

  async update(userId, noteId, title, content, color) {

    const check = await noteRepository.getNoteByUserId(userId);

    if (!check) {
      throw new Error('Note not found');
    }

    const note = await noteRepository.updateNote(noteId, title, content, color);

    if (!note) {
      throw new Error('Failed to update note');
    }

    return note
  }

  async delete(userId, noteId) {
    const check = await noteRepository.getNoteByUserId(userId);

    
    if (!check) {
      throw new Error('Note not found');
    }
    return noteRepository.deleteNoteById(noteId);
  }

  async getId() {
    return noteRepository.getNextId();
  }

  async getUserId() {
    return noteRepository.getNextUserId();
  }

  async createUserr(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await noteRepository.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email is already in use');
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Create a new user
      const user = await noteRepository.createUser(email, hashedPassword); // Adjust method name if needed

      // Return the created user information
      return {
        userId: user.userId,
        email: user.email,
      };
    } catch (error) {
      // Handle any errors that occur during user creation
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  async loginUser(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      // Fetch the user from the repository
      const user = await noteRepository.loginUser(email);

      // Check if user exists
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Return the token (or the user object with the token if needed)
      return token;
    } catch (error) {
      // Throw error if something goes wrong
      throw new Error('Invalid email or password');
    }
  }

  async forgotPassword(email) {
    if (!email) {
      throw new Error('email are required');
    }

    const user = await noteRepository.getUserByEmail(email);

    if (!user) {
      throw new Error('Invalid email');
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_CHANGE_PASSWORD, { expiresIn: '1h' });

    const response = await sendEmail(email, token);
    if (response === 0) {
      throw new Error('Email not sent');
    }
    return "success";
  }

  async changepassword(token, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_CHANGE_PASSWORD);
    const userId = decoded.userId;

    const user = await noteRepository.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return noteRepository.changepassword(user.userId, hashedPassword);
  }
}

module.exports = new NoteService();
