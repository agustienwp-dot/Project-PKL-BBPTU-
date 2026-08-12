require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const cageRoutes = require('./routes/cageRoutes');
const animalRoutes = require('./routes/animalRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const saleRoutes = require('./routes/saleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Endpoints
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cages', cageRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server if launched directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server Farm Management API running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
