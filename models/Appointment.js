const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide an appointment title'],
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide end time'],
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending',
  },
  serviceType: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  notes: {
    type: String,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  reminderSentAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
appointmentSchema.index({ providerId: 1, startTime: 1 });
appointmentSchema.index({ clientId: 1, startTime: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
