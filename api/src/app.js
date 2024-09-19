const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'https://www.suphasan.site','http://10.53.50.183:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use('/', noteRoutes);

module.exports = app;
