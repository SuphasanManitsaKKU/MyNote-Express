const express = require('express');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

app.use(express.json());
app.use('/api', noteRoutes);

module.exports = app;
