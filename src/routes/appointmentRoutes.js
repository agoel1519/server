import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { localStore } from '../services/localStore.js';

const router = express.Router();

// GET all appointments
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    }
  } catch (error) {}

  const localList = localStore.getAppointments();
  res.status(200).json({
    success: true,
    count: localList.length,
    data: localList,
    source: 'local'
  });
});

// POST create appointment / lead
router.post('/', async (req, res) => {
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

  const saved = localStore.saveAppointment(payload);

  try {
    if (mongoose.connection.readyState === 1) {
      const newAppointment = await Appointment.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Consultation request submitted successfully!',
        data: newAppointment
      });
    }
  } catch (error) {
    console.warn('MongoDB appointment save notice:', error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Consultation request submitted successfully!',
    data: saved
  });
});

// PATCH update status
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  localStore.updateAppointmentStatus(id, status);

  try {
    if (mongoose.connection.readyState === 1) {
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
    }
  } catch (error) {
    console.warn('MongoDB appointment update notice:', error.message);
  }

  res.status(200).json({
    success: true,
    data: { id, status }
  });
});

export default router;
