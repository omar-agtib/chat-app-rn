import { Platform } from "react-native";

export const API_BASE_URL =
  Platform.OS === "ios" ? "http://localhost:3000" : "http://10.0.2.2:3000";

export const CLOUDINARY_CLOUD_NAME = "drnmqijgj";
export const CLOUDINARY_UPLOAD_PRESET = "images";
