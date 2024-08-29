const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();
try {


    router.post('/notes', noteController.createNote);
    router.get('/notes/:userid', noteController.getAllNotes);
    // router.get('/notes/:noteid', noteController.getNoteById);
    router.put('/notes/:noteid', noteController.updateNote);
    router.delete('/notes/:noteid', noteController.deleteNote);

    router.get('/nextNoteId', noteController.getNextNoteId);
    router.get('/nextUserId', noteController.nextUserId);

    router.post('/register', noteController.createUser); // สร้างผู้ใช้
    router.post('/login', noteController.loginUser); // เข้าสู่ระบบ
}
catch (error) {
    console.log("hehe");

}

module.exports = router;