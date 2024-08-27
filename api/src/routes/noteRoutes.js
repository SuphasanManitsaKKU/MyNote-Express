const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.post('/notes', noteController.createNote);
router.get('/notes', noteController.getAllNotes);
router.get('/notes/:noteid', noteController.getNoteById);
router.put('/notes/:noteid', noteController.updateNote);
router.delete('/notes/:noteid', noteController.deleteNote);

module.exports = router;
