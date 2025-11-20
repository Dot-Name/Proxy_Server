import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import DB_connect from './config/connectDB.js';
import peerRoutes from './routes/peers.js';
import statusRoutes from './routes/status.js';
dotenv.config();
DB_connect();


const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cors(), express.json());
app.use('/api/peers', peerRoutes);
app.use('/api/status', statusRoutes);
app.listen(process.env.PORT||4000);
