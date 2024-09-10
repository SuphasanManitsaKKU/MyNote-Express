const noteService = require('../services/noteService');

class NoteController {
  async createNote(req, res) {
    try {
      const note = await noteService.create(req.body);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getNoteById(req, res) {
    try {
      const note = await noteService.getById(req.params.noteid);
      if (note) {
        res.status(200).json(note);
      } else {
        res.status(404).json({ error: 'Note not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllNotes(req, res) {
    try {
      const notes = await noteService.getAll(req.params.userId);
      res.status(200).json(notes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateNote(req, res) {
    try {
      const updatedNote = await noteService.update(req.params.noteid, req.body);
      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNote(req, res) {
    try {
      await noteService.delete(req.params.noteid);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getNextNoteId(req, res) {
    try {
      const getNextId = await noteService.getId();
      res.status(200).json({ nextId: getNextId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  async nextUserId(req, res) {
    try {
      const nextUserId = await noteService.getUserId();
      res.status(200).json({ nextUserId: nextUserId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  async createUser(req, res) {
    try {
      const newUser = await noteService.createUserr(req.body, res);
      res.status(200).json(newUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  async loginUser(req, res) {
    try {
      const token = await noteService.loginUser(req.body);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None', // ต้องใช้ 'None' เพื่อให้คุกกี้ถูกส่งข้ามโดเมน
        domain: '.suphasan.site', // ตรวจสอบให้แน่ใจว่าโดเมนตรงกัน
        maxAge: 3600000,
      });


      res.status(200).json({ token });
    } catch (error) {
      console.log("Login error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const status = await noteService.forgotPassword(req.body);
      res.status(200).json({ status: status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changepassword(req, res) {
    try {
      const status = await noteService.changepassword(req.body);
      res.status(200).json({ status: status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
module.exports = new NoteController();
