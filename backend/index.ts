import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.route";
import { initSocket } from "./socket/socket";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// listen to socket events
initSocket(server);

// Connect to the database and start the server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello Omar!");
});
