require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const hotelRoutes = require("./routes/hotels");
const experienceRoutes = require("./routes/experiences");
const bookingRoutes = require("./routes/bookings");
const plannerRoutes = require("./routes/planner");
const reviewRoutes = require("./routes/reviews");
const travelServiceRoutes = require("./routes/travelServices");

const app = express();

// ===============================
// Environment Variable Check
// ===============================

if (!process.env.MONGO_URI) {
  console.error(
    "MONGO_URI is missing. Add it to backend/.env before starting the API."
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is missing. Add it to backend/.env before starting the API."
  );
  process.exit(1);
}

// ===============================
// CORS Configuration
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://travel-boost.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===============================
// Middleware
// ===============================

app.use(express.json());

// ===============================
// Health Check
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TravelBoost API",
  });
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/hotels", hotelRoutes);

app.use("/api/experiences", experienceRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/planner", plannerRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/travel-services", travelServiceRoutes);

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ===============================
// Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal server error",
  });
});

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TravelBoost backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();