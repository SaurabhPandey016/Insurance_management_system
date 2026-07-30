import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Import MVC Routers
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import policyRoutes from './routes/policyRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Import Centralized Error Handler
import errorMiddleware from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

// Dynamic CORS setup to support credentials cookie sharing from any client origin (live app, previews, localhost)
app.use(cors({
  origin: (origin, callback) => {
    // Echo back the requesting origin to allow any client domain dynamically
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads statically (for document & receipt files)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount MVC API Routers
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send("Insurance Management System API is running smoothly.");
});

// Centralized error boundary middleware
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log(`Server is Running on PORT : ${process.env.PORT}`);
});