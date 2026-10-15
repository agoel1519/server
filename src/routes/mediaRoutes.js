import express from 'express';
import mongoose from 'mongoose';
import Media from '../models/Media.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { localStore } from '../config/localStore.js';

const router = express.Router();
const isMongoOnline = () => mongoose.connection.readyState === 1;

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG are allowed.'));
    }
  }
});

// Get all media
router.get('/', async (req, res) => {
  if (isMongoOnline()) {
    try {
      const media = await Media.find().sort({ createdAt: -1 });
      return res.json(media);
    } catch (error) {
      console.warn('MongoDB fetch media notice, using localStore:', error.message);
    }
  }

  res.json(localStore.getMedia());
});

// Upload media file and save metadata
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;

    const mediaData = {
      filename: req.file.filename,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      altText: req.body.altText || req.file.originalname
    };

    const localItem = localStore.addMedia(mediaData);

    if (isMongoOnline()) {
      try {
        const media = new Media(mediaData);
        const newMedia = await media.save();
        return res.status(201).json(newMedia);
      } catch (error) {
        console.warn('MongoDB media save notice, using localStore:', error.message);
      }
    }

    res.status(201).json(localItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  localStore.deleteMedia(req.params.id);

  if (isMongoOnline()) {
    try {
      await Media.findByIdAndDelete(req.params.id);
    } catch (error) {
      console.warn('MongoDB delete media notice:', error.message);
    }
  }

  res.json({ message: 'Media deleted' });
});

export default router;
