'use strict';

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your environment variables

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Bearer token
    
    if (token) {
        jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;
