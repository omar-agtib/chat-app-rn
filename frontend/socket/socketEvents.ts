import { getSocket } from "./socket";

export const testSocket = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) return console.error("Socket not connected");

  if (off) {
    socket.off("testSocketResponse", payload); // remove the same event you listen to
  } else if (typeof payload === "function") {
    socket.on("testSocketResponse", payload); // listen to server's response event
  } else {
    socket.emit("testSocket", payload); // emit the event server expects
  }
};

export const updateProfile = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) return console.error("Socket not connected");

  if (off) {
    socket.off("updateProfile", payload); // remove the same event you listen to
  } else if (typeof payload === "function") {
    socket.on("updateProfile", payload); // listen to server's response event
  } else {
    socket.emit("updateProfile", payload); // emit the event server expects
  }
};

export const getContacts = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) return console.error("Socket not connected");

  if (off) {
    socket.off("getContacts", payload); // remove the same event you listen to
  } else if (typeof payload === "function") {
    socket.on("getContacts", payload); // listen to server's response event
  } else {
    socket.emit("getContacts", payload); // emit the event server expects
  }
};
export const newConversation = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) return console.error("Socket not connected");

  if (off) {
    socket.off("newConversation", payload); // remove the same event you listen to
  } else if (typeof payload === "function") {
    socket.on("newConversation", payload); // listen to server's response event
  } else {
    socket.emit("newConversation", payload); // emit the event server expects
  }
};
export const getConversations = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) return console.error("Socket not connected");

  if (off) {
    socket.off("getConversations", payload); // remove the same event you listen to
  } else if (typeof payload === "function") {
    socket.on("getConversations", payload); // listen to server's response event
  } else {
    socket.emit("getConversations", payload); // emit the event server expects
  }
};
