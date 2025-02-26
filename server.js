import express from "express";
import cors from 'cors';
import bodyParser from "body-parser";
import routers from './src/routes/routes.js';
import dotenv from "dotenv"
// import "./src/config/websocket.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://mayoor-flax.vercel.app"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', "subject", "year", "classname", "quarter", "section", "ac_id", "lo_id", "ro_id", "id"],
}));

app.use(bodyParser.json());
app.use(express.json());

app.use('/api', routers)

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hey!!! Server is working fine!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
