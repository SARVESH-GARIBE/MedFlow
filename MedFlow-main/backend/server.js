import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import doctorRoutes from './routes/doctor.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import reviewRoutes from './routes/review.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import labTestRoutes from './routes/labTest.routes.js';
import packageRoutes from './routes/package.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://med-flow-three.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

//DB - Connect to MongoDB with proper initialization
let dbConnected = false;

const initializeApp = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        dbConnected = true;
        console.log("✅ Database connection verified. Server ready for requests.");
    } catch (error) {
        console.error("❌ Failed to initialize application:");
        console.error(error.message);
        process.exit(1);
    }
};

//Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/lab-tests', labTestRoutes);
app.use('/api/v1/packages', packageRoutes);

// 404 handler for API routes
app.use('/api/v1*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.get('/api', (req, res) => {
    if (dbConnected) {
        res.status(200).json({
            success: true,
            message: 'Api working - Database connected',
            database: 'MedFlow'
        });
    } else {
        res.status(503).json({
            success: false,
            message: 'Api waiting for database connection...'
        });
    }
});

// Serve static files from frontend dist (for production)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server only after database is connected
const startServer = async () => {
    try {
        await initializeApp();

        const server = app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   MedFlow Server Started Successfully  ║
╠════════════════════════════════════════╣
║ Server: http://localhost:${PORT}         ║
║ Environment: ${process.env.NODE_ENV || 'development'} ║
║ Database: MedFlow                      ║
║ Status: ✅ Ready for requests           ║
╚════════════════════════════════════════╝
        `);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('Server error:', error);
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
            });
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
