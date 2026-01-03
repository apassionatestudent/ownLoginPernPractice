import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // loads .env file contents into process.env

// create a connection pool, reusable database connection so the app can handle mutliple requests efficiently 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// if the database connection is successful, log a message
// event listener for when a new client is connected to the database 
pool.on('connect', () => {
    console.log('Connected to the database UwU');
});

// otherwise, log the error and exit the process
pool.on('error', (err) => {
    console.error('Database error', err);
    // process.exit(-1); for the sake of the tutorial, we won't exit the process
})

// export the pool to be used in other parts of the application
export default pool;
