const prisma = require('../config/prisma');

const checkHealth = async (req, res, next) => {
  try {
    let dbStatus = 'Disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'Connected';
    } catch (dbErr) {
      dbStatus = `Error: ${dbErr.message}`;
    }

    res.status(200).json({
      success: true,
      message: 'Farm Management API is running smoothly',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkHealth,
};
