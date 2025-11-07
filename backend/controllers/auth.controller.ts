import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/token";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, name, avatar } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, msg: "User already exists" });
      return;
    }

    // Create new user
    user = new User({ email, password, name, avatar: avatar || "" });

    // hash password before saving

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // gen JWT token
    const token = generateToken(user);

    res
      .status(201)
      .json({ success: true, msg: "User registered successfully", token });
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Server error");
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // find user by email
    let user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // gen JWT token
    const token = generateToken(user);

    res
      .status(201)
      .json({ success: true, msg: "User loged in  successfully", token });
  } catch (error) {
    console.error("Error", error);
    res.status(500).send("Server error");
  }
};
