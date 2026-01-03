import express from "express";
import cors from "cors"; // to allow cross-origin reqs 
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // to handle cookies 
import authRoutes from "./routes/auth.js"; // I don't see this authRoute 

dotenv.config(); // loads .env file contents into process.env

const app = express();

// use cors 
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // to enabe cookies to be sent in reqs 
}));

const PORT = process.env.PORT || 5000;

app.use(express.json()); // middleware to parse JSON request bodies
app.use(cookieParser()); // middleware to parse cookies from requests  ss

app.use("/api/auth", authRoutes); // in the URL with this, we can access the authRoute 
// http://localhost:5173/api/auth/login 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});