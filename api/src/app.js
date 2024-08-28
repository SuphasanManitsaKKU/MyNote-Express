const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // หรือโดเมนของเว็บแอปพลิเคชันของคุณ
    credentials: true,
}));

app.use(express.json());
app.use('/api', noteRoutes);

module.exports = app;
