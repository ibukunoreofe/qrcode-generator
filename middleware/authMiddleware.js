// authMiddleware.js

module.exports = function(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token from 'Bearer <token>'
    const expectedToken = process.env.API_TOKEN;

    if (!token || token !== expectedToken) {
        return res.status(403).json({ error: 'Invalid or missing token' });
    }

    // Token is valid, proceed to the next middleware or route handler
    next();
};
