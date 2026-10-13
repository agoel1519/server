import express from 'express';
import mongoose from 'mongoose';
import Setting from '../models/Setting.js';
import { localStore } from '../services/localStore.js';

const router = express.Router();

const defaultSettingsMap = {
  clinic_settings: {
    heroTitle: "CONTACT US",
    heroSubtitle: "We'd love to hear from you",
    formEyebrow: "GET IN TOUCH",
    formHeading: "Book Your Consultation",
    clinicName: "Aevora Clinics",
    address: "SCO 205 FF, Sector 5, Panchkula – 134114",
    phone: "+91 97797 66933",
    whatsapp: "+91 97797 66933",
    hours: "Mon – Sat: 10:00 AM – 8:00 PM | Sun: By Appointment",
    email: "concierge@aevoraclinics.com",
    website: "www.Aevoraclinics.com",
    responseTime: "We respond within 24 hours",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.722513470659!2d76.84852927647248!3d30.697334788975395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f937248b1111b%3A0x6b801a61dd0d027e!2sSector%205%2C%20Panchkula%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    expandingCities: "Chandigarh, Mohali, Delhi NCR"
  },
  footer_settings: {
    tagline: "A bespoke aesthetic and longevity sanctuary founded on clinical precision, US FDA-cleared science, and undetectable elegance.",
    founderName: "Dr. Meghna Mour",
    founderTitle: "Chief Aesthetic Dermatologist",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    linkedinUrl: "https://linkedin.com",
    youtubeUrl: "https://youtube.com",
    copyrightText: "AEVORA by Kian Clinics. All rights reserved.",
    logoUrl: "/aevora-logo-clean.png",
    logoWidth: "150",
    columns: [
      { id: '1', title: 'CLINICAL TREATMENTS', links: [
        { label: 'Chemical Peels', url: '/treatments/chemical-peels' },
        { label: 'Laser Pigment', url: '/treatments/pigment-laser' }
      ]},
      { id: '2', title: 'THE SANCTUARY', links: [
        { label: 'About Aevora', url: '#about' },
        { label: 'Our Doctors', url: '#team' }
      ]}
    ]
  }
};

// Get setting by key
router.get('/:key', async (req, res) => {
  const { key } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key });
      if (setting && setting.value !== undefined) {
        return res.json(setting);
      }
    }
  } catch (err) {
    // MongoDB error - fallback to localStore
  }

  // Fallback to localStore
  const localVal = localStore.getSetting(key);
  if (localVal !== null && localVal !== undefined) {
    return res.json({ key, value: localVal, source: 'local' });
  }

  // If known default setting exists, return it and save to localStore
  if (defaultSettingsMap[key]) {
    const val = defaultSettingsMap[key];
    localStore.saveSetting(key, val);
    return res.json({ key, value: val, source: 'default' });
  }

  // Return 200 with null value so the browser doesn't log 404 console errors
  res.json({ key, value: null, notFound: true });
});

// Update or create setting
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  // Always save to localStore first for instant persistence
  localStore.saveSetting(key, value);

  try {
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
      return res.json(setting);
    }
  } catch (error) {
    console.warn(`MongoDB setting save notice for ${key}:`, error.message);
  }

  // Return local saved version
  res.json({ key, value, success: true, stored: 'local' });
});

export default router;
