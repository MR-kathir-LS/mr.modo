const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all providers
router.get('/', protect, async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile/:userId', protect, async (req, res) => {
  try {
    // Prevent password change from this route
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get provider statistics
router.get('/stats/:providerId', protect, async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    
    const totalAppointments = await Appointment.countDocuments({
      providerId: req.params.providerId,
    });

    const completedAppointments = await Appointment.countDocuments({
      providerId: req.params.providerId,
      status: 'completed',
    });

    const averageRating = await Appointment.aggregate([
      { $match: { providerId: require('mongoose').Types.ObjectId(req.params.providerId), rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    res.json({
      totalAppointments,
      completedAppointments,
      averageRating: averageRating[0]?.avgRating || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
