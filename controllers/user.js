import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res, next) => {
    const { email, name, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(400).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ email, name, password: hashed });
    const result = await user.save();
    if (result) {
        res.status(201).json({ message: "User added", userId: result._id });
    } else {
        res.status(500).json({ message: "Server Error" });
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email doesn't exist" });
    const isTrue = await bcrypt.compare(password, user.password);
    if (!isTrue) return res.status(400).json({ message: "Wrong Password" });
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || "hasdbsabdsadlsabkdbas",
        { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Logged in", token });
};
