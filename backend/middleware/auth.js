import jwt from 'jsonwebtoken'; // to verify authentication tokens
import pool from '../config/db.js'; // import the database connection pool  

export const protect = async (req, res, next) => { // next is a function that passes control to the next middleware/route handler
    try {
        // get token from cookies
        const token = req.cookies.token;

        // if there's no token, user is not authenticated
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }

        // if token is found, decode it 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // using the decoded token info, fetch user from database
        const user = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]); // parameterized query 

        // if we cannot find the user, return unauthorized
        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // if we manged to find the user, attach user info to request object for use in next middleware/route handler
        res.req.user = user.rows[0];    
        next(); // pass control to the next middleware/route handler => ../routes/auth.js for 'protect' usage

    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

