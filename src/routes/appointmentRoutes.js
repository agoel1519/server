import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { localStore } from '../config/localStore.js';

const router = express.Router();
const isMongoOnline = () => mongoose.connection.readyState === 1;

// GET all appointments
router.get('/', async (req, res) => {
  if (isMongoOnline()) {
    try {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.warn('MongoDB appointments fetch notice, using localStore:', error.message);
    }
  }

  const localAppointments = localStore.getAppointments();
  res.status(200).json({
    success: true,
    count: localAppointments.length,
    data: localAppointments,
    source: 'local'
  });
});

// POST create appointment / lead
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, treatment, preferredDate, preferredTime, notes } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required to book a consultation'
      });
    }

    const payload = {
      name,
      phone,
      email: email || '',
      treatment: treatment || 'Consultation',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      notes: notes || '',
      status: 'new'
    };

    // Always record locally
    const localAppt = localStore.addAppointment(payload);

    if (isMongoOnline()) {
      try {
        const newAppointment = await Appointment.create(payload);
        return res.status(201).json({
          success: true,
          message: 'Consultation request submitted successfully!',
          data: newAppointment
        });
      } catch (error) {
        console.warn('MongoDB appointment save notice, fallback used:', error.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Consultation request recorded successfully (local store)!',
      data: localAppt,
      offlineFallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record appointment',
      error: error.message
    });
  }
});

// PATCH update status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const localUpdated = localStore.updateAppointmentStatus(id, status);

  if (isMongoOnline()) {
    try {
      const updated = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (updated) {
        return res.status(200).json({
          success: true,
          data: updated
        });
      }
    } catch (error) {
      console.warn('MongoDB update appointment notice:', error.message);
    }
  }

  if (localUpdated) {
    return res.status(200).json({
      success: true,
      data: localUpdated
    });
  }

  res.status(404).json({
    success: false,
    message: 'Appointment record not found'
  });
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoOnline()) {
    try {
      await Appointment.findByIdAndDelete(id);
    } catch (error) {
      console.warn('MongoDB delete appointment notice:', error.message);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully'
  });
});

export default router;
