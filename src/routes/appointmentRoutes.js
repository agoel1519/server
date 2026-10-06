import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments',
      error: error.message
    });
  }
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

    const newAppointment = await Appointment.create({
      name,
      phone,
      email: email || '',
      treatment: treatment || 'Consultation',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      notes: notes || '',
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully!',
      data: newAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record appointment',
      error: error.message
    });
  }
});

// PATCH update status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
});

export default router;
