'use strict';

const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your environment variables

const authenticateJWT = (req, res, next) => {
    const authorizationToken = req.header('Authorization')?.split(' ')[1]; // Bearer token
    
    if (authorizationToken) {
        jwt.verify(authorizationToken, jwtSecretKey, (jwtVerificationError, authenticatedUser) => {
            if (jwtVerificationError) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = authenticatedUser;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = authenticateJWT;
