import express from 'express';
import mongoose from 'mongoose';
import Setting from '../models/Setting.js';
import { localStore } from '../config/localStore.js';

const router = express.Router();

const isMongoOnline = () => mongoose.connection.readyState === 1;

// Get setting by key
router.get('/:key', async (req, res) => {
  const { key } = req.params;

  if (isMongoOnline()) {
    try {
      const setting = await Setting.findOne({ key });
      if (setting) {
        // Keep local cache synced
        localStore.saveSetting(key, setting.value);
        return res.json(setting);
      }
    } catch (err) {
      console.warn(`MongoDB fetch notice for ${key}, falling back to localStore:`, err.message);
    }
  }

  // Fallback to local store
  const localVal = localStore.getSetting(key);
  if (localVal !== null && localVal !== undefined) {
    return res.json({ key, value: localVal, source: 'local' });
  }

  res.status(404).json({ message: `Setting '${key}' not found` });
});

// Update or create setting
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  // Always persist locally first so edits are never lost
  const localResult = localStore.saveSetting(key, value);

  if (isMongoOnline()) {
    try {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
      return res.json(setting);
    } catch (err) {
      console.warn(`MongoDB update notice for ${key}, saved to local store:`, err.message);
      return res.json({ key, value, offlineFallback: true });
    }
  }

  res.json({ key, value, offlineFallback: true });
});

export default router;
