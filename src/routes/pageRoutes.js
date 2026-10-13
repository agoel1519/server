import express from 'express';
import mongoose from 'mongoose';
import Page from '../models/Page.js';
import { localStore } from '../services/localStore.js';

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const pages = await Page.find().sort({ createdAt: -1 });
      return res.json(pages);
    }
  } catch (error) {
    // MongoDB error - fallback
  }
  const pages = localStore.getPages();
  res.json(pages);
});

// Get page by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    if (mongoose.connection.readyState === 1) {
      const page = await Page.findOne({ slug });
      if (page) return res.json(page);
    }
  } catch (error) {}

  const localPage = localStore.getPage(slug);
  if (localPage) return res.json(localPage);

  // Return 200 with null so querying missing pages does not spam 404 network errors
  res.status(200).json(null);
});

// Create page
router.post('/', async (req, res) => {
  const pageData = req.body;
  const saved = localStore.savePage(pageData);

  try {
    if (mongoose.connection.readyState === 1) {
      const page = new Page(pageData);
      const newPage = await page.save();
      return res.status(201).json(newPage);
    }
  } catch (error) {
    console.warn('MongoDB page save notice:', error.message);
  }

  res.status(201).json(saved);
});

// Update page
router.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  const pageData = { ...req.body, slug };
  const saved = localStore.savePage(pageData);

  try {
    if (mongoose.connection.readyState === 1) {
      const page = await Page.findOneAndUpdate({ slug }, req.body, { new: true, upsert: true });
      return res.json(page);
    }
  } catch (error) {
    console.warn('MongoDB page update notice:', error.message);
  }

  res.json(saved);
});

// Delete page
router.delete('/:slug', async (req, res) => {
  const { slug } = req.params;
  localStore.deletePage(slug);

  try {
    if (mongoose.connection.readyState === 1) {
      await Page.findOneAndDelete({ slug });
      return res.json({ message: 'Page deleted' });
    }
  } catch (error) {
    console.warn('MongoDB page delete notice:', error.message);
  }

  res.json({ message: 'Page deleted' });
});

export default router;
