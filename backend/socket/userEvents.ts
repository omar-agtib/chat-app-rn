import { Server as SoketIOServer, Socket } from "socket.io";
import User from "../models/User";
import { generateToken } from "../utils/token";

export function registerUserEvents(io: SoketIOServer, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocketResponse", {
      msg: "realtime updates!",
    });
  });

  socket.on("updateProfile", async (data: { name: string; avatar: string }) => {
    console.log("updateProfile event received:", data);
    const userId = socket.data.userId;
    if (!userId) {
      return socket.emit("updateProfile", {
        success: false,
        msg: "User not authenticated",
      });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: data.name, avatar: data.avatar },
        { new: true }
      );
      // .select("-password"); // exclude password

      if (!updatedUser) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "User not found",
        });
      }

      // generate new token with updated user info
      const newToken = generateToken(updatedUser);

      socket.emit("updateProfile", {
        success: true,
        data: { token: newToken },
        msg: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      socket.emit("updateProfile", {
        success: false,
        msg: "Failed to update profile",
      });
    }
  });

  socket.on("getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;
      if (!currentUserId) {
        socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 } // exlude password field
      ).lean(); // will fetch js obejcts

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));
      socket.emit("getContacts", {
        success: true,
        data: contacts,
      });
    } catch (error: any) {
      console.log("getContacts error: ", error);
      socket.emit("getContacts", {
        success: false,
        msg: "Failed to fetch contacts",
      });
    }
  });
}
