import express from 'express';
import Treatment from '../models/Treatment.js';

const router = express.Router();

// GET all treatments
router.get('/', async (req, res) => {
  try {
    const treatments = await Treatment.find().sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve treatments',
      error: error.message
    });
  }
});

// GET single treatment by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();
    const treatment = await Treatment.findOne({ slug: cleanSlug });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: `Treatment '${cleanSlug}' not found in MongoDB`
      });
    }

    res.status(200).json({
      success: true,
      data: treatment
    });
  } catch (error) {
    console.error(`Error fetching treatment ${req.params.slug}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve treatment',
      error: error.message
    });
  }
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
    
    // Upsert so if it exists it updates, otherwise it creates
    const treatment = await Treatment.findOneAndUpdate(
      { slug: cleanSlug },
      { ...bodyData, slug: cleanSlug, isCustom: true },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' saved to MongoDB successfully`,
      data: treatment
    });
  } catch (error) {
    console.error('Error creating/updating treatment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save treatment to MongoDB',
      error: error.message
    });
  }
});

// PUT update treatment by slug
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slug.toLowerCase().trim();

    const treatment = await Treatment.findOneAndUpdate(
      { slug: cleanSlug },
      { ...req.body, slug: cleanSlug },
      { new: true, runValidators: true }
    );

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: `Treatment '${cleanSlug}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' updated successfully`,
      data: treatment
    });
  } catch (error) {
    console.error(`Error updating treatment ${req.params.slug}:`, error);
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

    const result = await Treatment.findOneAndDelete({ slug: cleanSlug });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Treatment '${cleanSlug}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Treatment '${cleanSlug}' removed from MongoDB`
    });
  } catch (error) {
    console.error(`Error deleting treatment ${req.params.slug}:`, error);
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

    const operations = items.map(item => ({
      updateOne: {
        filter: { slug: item.slug.toLowerCase().trim() },
        update: { $set: item },
        upsert: true
      }
    }));

    const result = await Treatment.bulkWrite(operations);
    res.status(200).json({
      success: true,
      message: `Batch sync complete! Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`,
      result
    });
  } catch (error) {
    console.error('Error seeding treatments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed treatments',
      error: error.message
    });
  }
});

export default router;
