require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const portalRoutes = require('./src/routes/portalRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const userProfileSettingRoute = require('./src/routes/profileSettingsRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const fs = require('fs');

const path = require('path');
const app = express();
// ✅ Body Parser Middleware (IMPORTANT)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(cors());
// ─── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 👈 Yeh allow karega images ko frontend par dikhne mein
  })
);


// CORS — allow the Vite frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);





// ─── General Middleware ────────────────────────────────────────────────────

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ContLinks API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Agar direct file access ho to: /api/uploads/filename.jpg -> uploads/filename.jpg
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Agar galti se url mein avatars aa jaye to bhi main uploads folder hi khule:
app.use('/api/uploads/avatars', express.static(path.join(__dirname, 'uploads')));
// Apply stricter rate limiting to auth routes
app.use('/api/auth',  authRoutes);
app.use('/api/website',  portalRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/userProfileSettings", userProfileSettingRoute);
app.use("/api/projects", require("./src/routes/projectRoutes"));
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 server  running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  process.exit(1);
});

module.exports = app;
