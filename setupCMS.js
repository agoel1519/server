import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'src', 'models');
const routesDir = path.join(__dirname, 'src', 'routes');

const pageModel = `import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'hero', 'content', 'features', 'before-after', 'accordion'
  visibility: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  design: { type: mongoose.Schema.Types.Mixed, default: {} }, // section-specific design (bg color, spacing)
  content: { type: mongoose.Schema.Types.Mixed, default: {} } // section content
}, { _id: false });

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  seo: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: String, default: '' },
    ogImage: { type: String, default: '' }
  },
  sections: [SectionSchema],
  author: { type: String, default: 'Admin' }
}, { timestamps: true });

const Page = mongoose.model('Page', PageSchema);
export default Page;
`;

const settingModel = `import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true }, // 'theme', 'navigation', 'general', 'footer'
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const Setting = mongoose.model('Setting', SettingSchema);
export default Setting;
`;

const mediaModel = `import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  altText: { type: String, default: '' },
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  }
}, { timestamps: true });

const Media = mongoose.model('Media', MediaSchema);
export default Media;
`;

const pageRoutes = `import express from 'express';
import Page from '../models/Page.js';

const router = express.Router();

// Get all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get page by slug
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create page
router.post('/', async (req, res) => {
  try {
    const page = new Page(req.body);
    const newPage = await page.save();
    res.status(201).json(newPage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update page
router.put('/:slug', async (req, res) => {
  try {
    const page = await Page.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true, upsert: true });
    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete page
router.delete('/:slug', async (req, res) => {
  try {
    await Page.findOneAndDelete({ slug: req.params.slug });
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`;

const settingRoutes = `import express from 'express';
import Setting from '../models/Setting.js';

const router = express.Router();

// Get setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update or create setting
router.put('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
`;

// Simple media routes (assuming public dir or base64 for now, since we need simple implementation without S3)
const mediaRoutes = `import express from 'express';
import Media from '../models/Media.js';

const router = express.Router();

// Get all media
router.get('/', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save media metadata
router.post('/', async (req, res) => {
  try {
    const media = new Media(req.body);
    const newMedia = await media.save();
    res.status(201).json(newMedia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
`;

fs.writeFileSync(path.join(modelsDir, 'Page.js'), pageModel);
fs.writeFileSync(path.join(modelsDir, 'Setting.js'), settingModel);
fs.writeFileSync(path.join(modelsDir, 'Media.js'), mediaModel);

fs.writeFileSync(path.join(routesDir, 'pageRoutes.js'), pageRoutes);
fs.writeFileSync(path.join(routesDir, 'settingRoutes.js'), settingRoutes);
fs.writeFileSync(path.join(routesDir, 'mediaRoutes.js'), mediaRoutes);

console.log("CMS Models and Routes generated successfully.");
