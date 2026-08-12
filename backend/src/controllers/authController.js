const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
};
