import express from 'express';
import mongoose from 'mongoose';
import Treatment from '../models/Treatment.js';
import { localStore } from '../config/localStore.js';

const router = express.Router();
const isMongoOnline = () => mongoose.connection.readyState === 1;

// GET all treatments
router.get('/', async (req, res) => {
  if (isMongoOnline()) {
    try {
      const treatments = await Treatment.find().sort({ updatedAt: -1 });
      if (treatments && treatments.length > 0) {
        return res.status(200).json({
          success: true,
          count: treatments.length,
          data: treatments
        });
      }
    } catch (error) {
      console.warn('MongoDB treatments fetch notice, using localStore:', error.message);
    }
  }

  // Fallback to local store
  const localTreatments = localStore.getTreatments();
  res.status(200).json({
    success: true,
    count: localTreatments.length,
    data: localTreatments,
    source: 'local'
  });
});

// GET single treatment by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = (slug || '').toLowerCase().trim();

  if (isMongoOnline()) {
    try {
      const treatment = await Treatment.findOne({ slug: cleanSlug });
      if (treatment) {
        return res.status(200).json({
          success: true,
          data: treatment
        });
      }
    } catch (error) {
      console.warn(`MongoDB single treatment ${cleanSlug} notice, using localStore:`, error.message);
    }
  }

  const localItem = localStore.getTreatmentBySlug(cleanSlug);
  if (localItem) {
    return res.status(200).json({
      success: true,
      data: localItem,
      source: 'local'
    });
  }

  res.status(404).json({
    success: false,
    message: `Treatment '${cleanSlug}' not found`
  });
});

// POST create or upsert treatment
router.post('/', async (req, res) => {
  try {
    const { slug, ...bodyData } = req.body;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Treatment slug is required'
      });
    }

    const cleanSlug = slug.toLowerCase().trim();
    const payload = { ...bodyData, slug: cleanSlug, isCustom: true };

    // Always mirror to local store
    const localSaved = localStore.saveTreatment(payload);

    if (isMongoOnline()) {
      try {
        const treatment = await Treatment.findOneAndUpdate(
          { slug: cleanSlug },
          payload,
          { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
          success: true,
          message: `Treatment '${cleanSlug}' saved successfully`,
          data: treatment
        });
      } catch (error) {
        console.warn('MongoDB save notice, fallback used:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' saved to local store`,
      data: localSaved,
      offlineFallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save treatment',
      error: error.message
    });
  }
});

// PUT update treatment by slug
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();
    const payload = { ...req.body, slug: cleanSlug };

    const localSaved = localStore.saveTreatment(payload);

    if (isMongoOnline()) {
      try {
        const treatment = await Treatment.findOneAndUpdate(
          { slug: cleanSlug },
          payload,
          { new: true, runValidators: true }
        );

        if (treatment) {
          return res.status(200).json({
            success: true,
            message: `Treatment '${cleanSlug}' updated successfully`,
            data: treatment
          });
        }
      } catch (error) {
        console.warn('MongoDB update notice, fallback used:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' updated in local store`,
      data: localSaved,
      offlineFallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment',
      error: error.message
    });
  }
});

// DELETE treatment by slug
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();

    localStore.deleteTreatment(cleanSlug);

    if (isMongoOnline()) {
      try {
        await Treatment.findOneAndDelete({ slug: cleanSlug });
      } catch (error) {
        console.warn('MongoDB delete notice:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' removed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete treatment',
      error: error.message
    });
  }
});

// POST seed batch treatments into MongoDB
router.post('/seed/bulk', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must include an array of treatment items'
      });
    }

    items.forEach(item => localStore.saveTreatment(item));

    if (isMongoOnline()) {
      try {
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
      } catch (error) {
        console.warn('MongoDB bulkWrite notice:', error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Batch sync complete in local store (${items.length} items)`,
      offlineFallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed treatments',
      error: error.message
    });
  }
});

export default router;
