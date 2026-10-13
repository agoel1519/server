import express from 'express';
import mongoose from 'mongoose';
import Treatment from '../models/Treatment.js';
import { localStore } from '../services/localStore.js';

const router = express.Router();

// GET all treatments
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const treatments = await Treatment.find().sort({ updatedAt: -1 });
      return res.status(200).json({
        success: true,
        count: treatments.length,
        data: treatments
      });
    }
  } catch (error) {}

  const localTreatmentsMap = localStore.getTreatments();
  const list = Object.values(localTreatmentsMap);
  res.status(200).json({
    success: true,
    count: list.length,
    data: list,
    source: 'local'
  });
});

// GET single treatment by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = slug.toLowerCase().trim();

  try {
    if (mongoose.connection.readyState === 1) {
      const treatment = await Treatment.findOne({ slug: cleanSlug });
      if (treatment) {
        return res.status(200).json({
          success: true,
          data: treatment
        });
      }
    }
  } catch (error) {}

  const localItem = localStore.getTreatment(cleanSlug);
  if (localItem) {
    return res.status(200).json({
      success: true,
      data: localItem,
      source: 'local'
    });
  }

  // Return 200 with data: null so frontend check doesn't trigger 404 console errors
  res.status(200).json({
    success: false,
    data: null,
    message: `Treatment '${cleanSlug}' not found`
  });
});

// POST create or upsert treatment
router.post('/', async (req, res) => {
  const { slug, ...bodyData } = req.body;
  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'Treatment slug is required'
    });
  }

  const cleanSlug = slug.toLowerCase().trim();
  const itemToSave = { ...bodyData, slug: cleanSlug, isCustom: true };
  localStore.saveTreatment(cleanSlug, itemToSave);

  try {
    if (mongoose.connection.readyState === 1) {
      const treatment = await Treatment.findOneAndUpdate(
        { slug: cleanSlug },
        itemToSave,
        { new: true, upsert: true, runValidators: true }
      );
      return res.status(200).json({
        success: true,
        message: `Treatment '${cleanSlug}' saved to MongoDB successfully`,
        data: treatment
      });
    }
  } catch (error) {
    console.warn('MongoDB treatment save notice:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `Treatment '${cleanSlug}' saved locally`,
    data: itemToSave
  });
});

// PUT update treatment by slug
router.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = slug.toLowerCase().trim();
  const itemToSave = { ...req.body, slug: cleanSlug };
  localStore.saveTreatment(cleanSlug, itemToSave);

  try {
    if (mongoose.connection.readyState === 1) {
      const treatment = await Treatment.findOneAndUpdate(
        { slug: cleanSlug },
        itemToSave,
        { new: true, runValidators: true }
      );
      if (treatment) {
        return res.status(200).json({
          success: true,
          message: `Treatment '${cleanSlug}' updated successfully`,
          data: treatment
        });
      }
    }
  } catch (error) {
    console.warn('MongoDB treatment update notice:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `Treatment '${cleanSlug}' updated locally`,
    data: itemToSave
  });
});

// DELETE treatment by slug
router.delete('/:slug', async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = slug.toLowerCase().trim();
  localStore.deleteTreatment(cleanSlug);

  try {
    if (mongoose.connection.readyState === 1) {
      await Treatment.findOneAndDelete({ slug: cleanSlug });
    }
  } catch (error) {
    console.warn('MongoDB treatment delete notice:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `Treatment '${cleanSlug}' removed`
  });
});

// POST seed batch treatments
router.post('/seed/bulk', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body must include an array of treatment items'
    });
  }

  items.forEach(item => {
    if (item.slug) {
      localStore.saveTreatment(item.slug.toLowerCase().trim(), item);
    }
  });

  try {
    if (mongoose.connection.readyState === 1) {
      const operations = items.map(item => ({
        updateOne: {
          filter: { slug: item.slug.toLowerCase().trim() },
          update: { $set: item },
          upsert: true
        }
      }));
      const result = await Treatment.bulkWrite(operations);
      return res.status(200).json({
        success: true,
        message: `Batch sync complete! Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`,
        result
      });
    }
  } catch (error) {
    console.warn('MongoDB seed notice:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `Batch sync complete locally! Saved ${items.length} treatments.`
  });
});

export default router;
