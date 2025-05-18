const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // 1. Get authorization header
    const authHeader = req.headers['authorization'];
    
    // 2. Check if header exists and is properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid authorization header found');
        return res.status(401).json({ 
            success: false,
            message: 'No token provided',
            code: 'MISSING_TOKEN'
        });
    }

    // 3. Extract token
    const token = authHeader.split(' ')[1];
    console.log('Received token:', token ? `${token.substring(0, 10)}...` : 'NULL'); // Safe logging

    if (!token) {
        console.log('Empty token after extraction');
        return res.status(401).json({
            success: false,
            message: 'Malformed token',
            code: 'MALFORMED_TOKEN'
        });
    }

    try {
        // 4. Verify token
        console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'exists' : 'missing');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token successfully decoded for user:', decoded.id);
        
        // 5. Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        
        let message = 'Invalid token';
        let code = 'INVALID_TOKEN';
        
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
            code = 'TOKEN_EXPIRED';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Malformed token';
            code = 'MALFORMED_TOKEN';
        }
        
        return res.status(401).json({ 
            success: false,
            message,
            code
        });
    }
};

module.exports = authenticate;