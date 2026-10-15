import express from 'express';
import mongoose from 'mongoose';
import Page from '../models/Page.js';
import { localStore } from '../config/localStore.js';

const router = express.Router();
const isMongoOnline = () => mongoose.connection.readyState === 1;

// Get all pages
router.get('/', async (req, res) => {
  if (isMongoOnline()) {
    try {
      const pages = await Page.find().sort({ createdAt: -1 });
      return res.json(pages);
    } catch (error) {
      console.warn('MongoDB fetch pages notice, using localStore:', error.message);
    }
  }

  res.json(localStore.getPages());
});

// Get page by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (isMongoOnline()) {
    try {
      const page = await Page.findOne({ slug });
      if (page) return res.json(page);
    } catch (error) {
      console.warn(`MongoDB single page ${slug} notice:`, error.message);
    }
  }

  const localPage = localStore.getPageBySlug(slug);
  if (localPage) return res.json(localPage);

  res.status(404).json({ message: 'Page not found' });
});

// Create page
router.post('/', async (req, res) => {
  const localPage = localStore.savePage(req.body);

  if (isMongoOnline()) {
    try {
      const page = new Page(req.body);
      const newPage = await page.save();
      return res.status(201).json(newPage);
    } catch (error) {
      console.warn('MongoDB create page notice, using localStore:', error.message);
    }
  }

  res.status(201).json(localPage);
});

// Update page
router.put('/:slug', async (req, res) => {
  const localPage = localStore.savePage({ ...req.body, slug: req.params.slug });

  if (isMongoOnline()) {
    try {
      const page = await Page.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        { new: true, upsert: true }
      );
      return res.json(page);
    } catch (error) {
      console.warn('MongoDB update page notice, using localStore:', error.message);
    }
  }

  res.json(localPage);
});

// Delete page
router.delete('/:slug', async (req, res) => {
  localStore.deletePage(req.params.slug);

  if (isMongoOnline()) {
    try {
      await Page.findOneAndDelete({ slug: req.params.slug });
    } catch (error) {
      console.warn('MongoDB delete page notice:', error.message);
    }
  }

  res.json({ message: 'Page deleted' });
});

export default router;
