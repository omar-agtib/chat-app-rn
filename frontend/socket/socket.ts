import { API_BASE_URL } from "@/constants";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

export async function connetSocket(): Promise<Socket> {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("No token found in localStorage");
  }

  if (!socket) {
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    // log auth/connect problems
    socket.on("connect_error", (err) => {
      console.log("Socket connect_error:", err.message);
    });

    // wait for the socket to connect
    await new Promise((resolve) => {
      socket?.on("connect", () => {
        console.log("Socket connected", socket?.id);
        resolve(true);
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:");
    });
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
