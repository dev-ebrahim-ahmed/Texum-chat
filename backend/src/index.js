import express from 'express'

import cors from 'cors'
import dotenv from 'dotenv'
import cookiePaser from 'cookie-parser'

import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js'
import { app, server } from './lib/socket.js'
import path from 'path';

dotenv.config()

const PORT = process.env.PORT || 5001

const __dirname = path.resolve();

app.use(cookiePaser())
app.use(express.json({ limit: "50mb"}));
app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
    connectDB();
    console.log(`Server listening on port http://localhost:${PORT}`);
});