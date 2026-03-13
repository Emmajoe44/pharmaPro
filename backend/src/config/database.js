const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'your_username', // replace with your database username
    password: 'your_password', // replace with your database password
    database: 'your_database', // replace with your database name
});

module.exports = { pool };