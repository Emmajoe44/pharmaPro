'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const currenciesRouter = require('./src/routes/currencies');
const laboratoryRouter = require('./src/routes/laboratory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/currencies', currenciesRouter);
app.use('/api/laboratory', laboratoryRouter);

app.get('/', (req, res) => {
    res.json({ message: 'PharmaPro API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
