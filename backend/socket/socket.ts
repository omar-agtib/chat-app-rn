import dotenv from "dotenv";
import { Server as SoketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerUserEvents } from "./userEvents";
import { registerChatEvents } from "./chatEvents";
import Conversation from "../models/Conversation";

dotenv.config({ quiet: true });

export function initSocket(server: any): SoketIOServer {
  const io = new SoketIOServer(server, {
    cors: {
      origin: "*",
      //   methods: ["GET", "POST"],
      //   credentials: true,
    },
  });

  // auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: Invalid token"));
        }
        // Attach user info to socket object
        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      }
    );
  });

  // Handle socket connections
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(` User connected: ${userId} ,username: ${socket.data.name}`);

    // register event listeners here
    registerChatEvents(io, socket);
    registerUserEvents(io, socket);

    // join all the conversations the user is part of

    try {
      const conversations = await Conversation.find({
        participants: userId,
      }).select("_id");

      conversations.forEach((conversation) => {
        socket.join(conversation._id.toString());
      });
    } catch (error: any) {
      console.log("Error joining conversations: ", error);
    }

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
