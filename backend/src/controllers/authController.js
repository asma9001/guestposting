const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================
// SIGNUP
// =====================
const signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    // Validate passwords match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Validate role
    const allowedRoles = ["advertiser", "publisher"];
    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (!allowedRoles.includes(normalizedRole)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid role. Must be 'advertiser' or 'publisher'",
        });
    }

    // Check if user exists
    const userExist = await User.findOne({ email});
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user with normalized role
    const userCreated = await User.create({
      fullName: fullName.trim(),
      email: email,
      role: normalizedRole, // ✅ Make sure role is lowercase
      password: hashPassword,
    });

    // Generate token
    const token = jwt.sign({ id: userCreated._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: userCreated._id,
        fullName: userCreated.fullName,
        email: userCreated.email,
        role: userCreated.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================
// LOGIN
// =====================
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validation: Check if fields exist
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Fetch User
    const user = await User.findOne({ email });
    console.log("DATABASE USER OBJECT:",user.password, user.role); // Debugging line to check what we get from DB
    // 3. Check if user exists
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Role Match Check (After confirming user exists)
    if (user.role !== role) {
      return res.status(403).json({ success: false, message: `You are not registered as a ${role}` });
    }

    // 5. Safety check for password field (Fixes your "Illegal arguments" error)
    if (!user.password) {
      return res.status(500).json({ success: false, message: "User account is corrupted (no password found)" });
    }

    // 6. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 7. JWT Secret Check
    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET is not defined in .env");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // 8. Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // 9. Success Response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// =====================
// GET CURRENT USER
// =====================



const getUserByID = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  getUserByID,
};
