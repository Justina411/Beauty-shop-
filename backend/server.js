require("dotenv").config({ override: true });
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Force Google's DNS to prevent SRV resolution errors on local ISP networks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// Environment variables fallback
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_beauty_shop_key";
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://atujustinairuoma411_db_user:beautyshop2026base@ac-gsvybdy-shard-00-00.e8qmjk5.mongodb.net:27017,ac-gsvybdy-shard-00-01.e8qmjk5.mongodb.net:27017,ac-gsvybdy-shard-00-02.e8qmjk5.mongodb.net:27017/beautyshop?ssl=true&replicaSet=atlas-rilx0h-shard-0&authSource=admin&appName=BeautyShop";
const PORT = process.env.PORT || 5000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Database Connection Check Middleware (MUST come before API routes)
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Please try again in a few seconds.",
    });
  }
  next();
});

// ==========================================
// 2. REGISTER API ROUTES
// ==========================================
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// ==========================================
// 3. SCHEMAS & MODELS
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  items: { type: Array, required: true },
  status: { type: String, default: "paid" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  request: { type: String, default: "" },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Contact Message Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "unread" },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// Password Strength Validator Helper
const isStrongPassword = (password) => {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;
  return strongRegex.test(password);
};

// ==========================================
// 4. AUTHENTICATION ROUTES
// ==========================================

// POST: Signup Route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, containing uppercase, lowercase, number, and special character (@$!%*?&).",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists!" });
    }

    return res
      .status(500)
      .json({ message: err.message || "Server error during signup." });
  }
});

// POST: Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    if (!existingUser.password) {
      return res.status(400).json({
        message: "Account record corrupted. Please sign up again.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Incorrect password. Please try again." });
    }

    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error during login." });
  }
});

// ==========================================
// 5. APPOINTMENT BOOKING ROUTES
// ==========================================

// POST: Book Appointment Route
app.post("/api/appointments/book", async (req, res) => {
  try {
    const { name, email, phone, service, date, time, request } = req.body;

    if (!name || !email || !phone || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const newAppointment = await Appointment.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      service,
      date,
      time,
      request,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to book appointment. Please try again.",
    });
  }
});

// GET: Fetch All Appointments (for dashboard / admin view)
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    return res.json({ success: true, appointments });
  } catch (err) {
    console.error("FETCH APPOINTMENTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve appointments.",
    });
  }
});

// ==========================================
// 6. CONTACT MESSAGES ROUTES
// ==========================================

// POST: Submit Contact Message Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const newContact = await Contact.create({
      name,
      email: email.toLowerCase().trim(),
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      contact: newContact,
    });
  } catch (err) {
    console.error("CONTACT FORM ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to send message. Please try again.",
    });
  }
});

// GET: Fetch All Contact Messages (for admin dashboard)
app.get("/api/contact", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json({ success: true, contacts });
  } catch (err) {
    console.error("FETCH CONTACTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to retrieve messages.",
    });
  }
});

// ==========================================
// 7. PAYMENT VERIFICATION ROUTE
// ==========================================
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { reference, cartItems, totalAmount, userEmail } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, message: "Missing reference." });
    }

    // 1. Verify transaction directly with Paystack API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // 2. Confirm Paystack verified status
    if (data.status && data.data.status === "success") {
      
      // 3. Prevent duplicate order creation if reference already exists
      const existingOrder = await Order.findOne({ reference });
      if (!existingOrder) {
        await Order.create({
          userEmail: userEmail || data.data.customer.email,
          reference: reference,
          amount: data.data.amount / 100, // Converts Kobo back to Naira
          items: cartItems || [],
          status: "paid",
        });
      }

      return res.json({
        success: true,
        message: "Payment verified successfully and order recorded.",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.message || "Payment verification failed with Paystack.",
      });
    }
  } catch (err) {
    console.error("PAYMENT VERIFICATION ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error during payment verification.",
    });
  }
});

// ==========================================
// 8. DYNAMIC STATS ROUTE FOR ABOUT PAGE
// ==========================================
app.get("/api/stats", async (req, res) => {
  try {
    const productCount = mongoose.models.Product ? await mongoose.models.Product.countDocuments() : 50;
    const customerCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();

    return res.json({
      success: true,
      stats: {
        products: productCount || 50,
        customers: customerCount || 120,
        orders: orderCount || 200,
        brands: 20,
      },
    });
  } catch (err) {
    console.error("STATS FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      stats: { products: 50, customers: 120, orders: 200, brands: 20 },
    });
  }
});

// ==========================================
// 9. DATABASE CONNECTION & SERVER STARTUP
// ==========================================
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB Database!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

startServer();