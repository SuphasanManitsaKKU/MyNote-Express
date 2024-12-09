const express = require('express');
const noteController = require('../controllers/noteController');
const authenticate = require('../middleware');

const prisma = require('../prisma/client');

const router = express.Router();
try {
    // Route to test Prisma and database connection
    router.get('/', async (req, res) => {
        res.json({ message: 'Welcome to the Notes API!' });
    });
    
    router.get('/test', async (req, res) => {
        try {
            const allUsers = await prisma.user.findMany();
            res.json(allUsers);
        } catch (error) {
            console.error('Detailed Error:', error);
            res.status(500).json({ error: 'An error occurred while fetching users.' });
        }
    });
    
    router.post('/login', noteController.loginUser);
    router.post('/register', noteController.createUser);
    router.post('/forgotpassword', noteController.forgotPassword);
    router.post('/changepassword', noteController.changepassword);

    router.use(authenticate);

    router.post('/notes', noteController.createNote);
    router.get('/notes/:userId', noteController.getAllNotes);

    router.put('/notes/:userId/:noteId', noteController.updateNote); // แก้ไข note
    router.delete('/notes/:userId/:noteId', noteController.deleteNote); // ลบ note

    //add by pond
    router.get('/user/:userId/email', noteController.getUserEmail);

}
catch (error) {
    console.error(error);
}

module.exports = router;