const express = require('express');
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Book an appointment
router.post('/', protect, [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { providerId, title, startTime, endTime, serviceType, description, location, notes } = req.body;

    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Check for time conflicts
    const existingAppointment = await Appointment.findOne({
      providerId,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
          status: { $ne: 'cancelled' },
        },
      ],
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }

    const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000);

    const appointment = new Appointment({
      clientId: req.user.id,
      providerId,
      title,
      startTime,
      endTime,
      duration,
      serviceType,
      description,
      location,
      notes,
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointments for a user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [
        { clientId: req.params.userId },
        { providerId: req.params.userId },
      ],
    };

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email businessName')
      .sort({ startTime: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get appointment by ID
router.get('/:appointmentId', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('clientId', 'name email phone')
      .populate('providerId', 'name email businessName');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.patch('/:appointmentId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment status updated',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel appointment
router.delete('/:appointmentId', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      {
        status: 'cancelled',
        cancellationReason,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add review/rating to appointment
router.patch('/:appointmentId/review', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rating, feedback } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { rating, feedback, updatedAt: Date.now() },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      message: 'Review added successfully',
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
