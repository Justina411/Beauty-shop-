const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in every field." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    const newUser = await User.create({ name, email, password });
    const token = generateToken(newUser);

    res.status(201).json({
      message: `Welcome, ${newUser.name}!`,
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({
        message: "We couldn't find an account with that email. Please create an account first.",
        newUser: true,
      });
    }

    const passwordMatches = await existingUser.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const token = generateToken(existingUser);

    res.status(200).json({
      message: `Welcome back, ${existingUser.name}!`,
      token,
      user: { id: existingUser._id, name: existingUser.name, email: existingUser.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
