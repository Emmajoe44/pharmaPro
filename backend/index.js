'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const currenciesRouter = require('./routes/currencies');
const laboratoryRouter = require('./routes/laboratory');

app.use('/api/currencies', currenciesRouter);
app.use('/api/laboratory', laboratoryRouter);

app.get('/', (req, res) => {
    res.json({ message: 'PharmaPro API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
