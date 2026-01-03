import express from 'express';
import bcrypt from 'bcryptjs'; // to hash passwords
import jwt from 'jsonwebtoken'; // to create authentication tokens
import pool from '../config/db.js'; // import the database connection pool
import { protect } from '../middleware/auth.js'; // import the protect middleware to secure routes

const router = express.Router(); // create a router for our auth routes

/*
    Since we'll be working with cookies
    Set up cookie options for security
*/
const cookieOptions = {
    httpOnly: true, // cookie is only accessible by the web server, can't be accessed by JavaScript on the client side (browser)
    secure: process.env.NODE_ENV === 'production', // cookie is only sent over HTTPS in production
    sameSite: 'Strict', // cookie is not sent with cross-site requests, Cross-Site Request Forgery (CSRF) attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // cookie expires after 30 days 
    /*
    30 => days 
    * 
    24 => hours in a day
    60 => minutes in an hour
    60 => seconds in a minute
    1000 => milliseconds in a second
    */
};

// functions to generate tokens 
const generateToken = (id) => {
    // signs token with user id 
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // token expires in 30 days, as also shown above 
    }); 
};


// Register end point 
router.post('/register', async (req, res) => {
    // destructure the request body to get user details
    const { name, email, password } = req.body; 
    // we use the 'app.use(express.json());', we can get access to these variables 

    // check if all required fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // checks if user already exists by checking the email in the database
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    // parameterized query to prevent SQL injection by treating user input as data, not executable code

    // if it finds a user with that email, then return an error
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // if user doesn't exist, hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10); 
    /*
     * 10 is the salt rounds, higher means more secure but slower
     * It tells Bcrypt how many times to process the password 
     */
    
    // create the new user in the database 
    const newUser = await pool.query( 
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
        // then again, parameterized query to prevent SQL injection 
    );

    const token = generateToken(newUser.rows[0].id); // generate a token for the new user

    // store the token in cookie options defined above
    res.cookie('token', token, cookieOptions); // set the token in an HTTP-only cookie
    /**
     * res.cookie() is an Express function to set a cookie in the client's browser
     * 'token' - name of the cookie
     * token - value of the cookie, JWT generated for rhe user 
     * cookieOptions - options for the cookie
    */

    return res.status(201).json({ user: newUser.rows[0]}); 
    // return only the user's id, name, and email to the frontend, the password is never sent 
    // refer to the const newUser above, RETURNING id, username, email 
});


// Login end point
router.post('/login', async (req, res) => {
    const { email, password } = req.body;   
    // destructure the request body to get user details, only need the following data for login 

    // check if all required fields are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields UwU' });
    }

    // find the user by his email address 
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // then agan, parameterized query to prevent SQL injection

    // can't find the user with that email
    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials UwU' });
    }

    const userData = user.rows[0]; // get the user data from the query result 

    const isMatch = await bcrypt.compare(password, userData.password);
    // password is from the form, userData.password is the hashed password from the database that we got to compare with 

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials UwU' });
    }

    // but if password is equal to each other, generate a JWT token 
    const token = generateToken(userData.id);

    // store the token in cookie options defined above
    res.cookie('token', token, cookieOptions); // set the token in an HTTP-only cookie

    res.json({ user: { 
        id: userData.id, 
        name: userData.name, 
        email: userData.email } });
    // return only the user's id, name, and email to the frontend, the password is never sent
});


// Route for the loggedin user, Me endpoint
router.get('/me', protect, async (req, res) => {
    res.json(req.user);  // next() in the protect middleware attaches the user info to req.user from ../middleware/auth.js
    // return info of the logged in user from protect middleware 
    
});


// Logout end point
router.post('/logout', (req, res) => {
    res.cookie('token', '', {  //overwrite the token cookie with an empty string, therefore clearing it
        ...cookieOptions, 
        maxAge: 1, // 1 milisecond expiration time
    });
    res.json({ message: 'Logged out successfully UwU' });
});

export default router; // export the router to be used in server.js or in other parts of the web application