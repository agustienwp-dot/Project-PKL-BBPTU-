const dashboardService = require('../services/dashboardService');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json({
      success: true,
      message: 'Statistik dashboard berhasil diambil',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
