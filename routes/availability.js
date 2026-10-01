const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Availability = require('../models/Availability');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create availability slot
router.post('/', protect, authorize('provider'), [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('End time must be in HH:MM format'),
  body('slots').isInt({ min: 1 }).withMessage('Slots must be at least 1'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { date, startTime, endTime, slots, isRecurring, recurringPattern } = req.body;

    const availability = new Availability({
      providerId: req.user.id,
      date,
      startTime,
      endTime,
      slots,
      isRecurring,
      recurringPattern,
    });

    await availability.save();

    res.status(201).json({
      message: 'Availability slot created',
      availability,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get availability for a provider
router.get('/provider/:providerId', protect, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { providerId: req.params.providerId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.date = { $gte: startDate, $lt: endDate };
    }

    const availabilities = await Availability.find(query).sort({ date: 1, startTime: 1 });

    res.json(availabilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update availability
router.put('/:availabilityId', protect, async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(
      req.params.availabilityId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    res.json({
      message: 'Availability updated',
      availability,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete availability
router.delete('/:availabilityId', protect, async (req, res) => {
  try {
    const availability = await Availability.findByIdAndDelete(req.params.availabilityId);

    if (!availability) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    res.json({ message: 'Availability deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
