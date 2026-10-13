import express from 'express';
import mongoose from 'mongoose';
import Media from '../models/Media.js';
import { localStore } from '../services/localStore.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

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
  try {
    if (mongoose.connection.readyState === 1) {
      const media = await Media.find().sort({ createdAt: -1 });
      return res.json(media);
    }
  } catch (error) {}

  const localMedia = localStore.getMedia();
  res.json(localMedia);
});

import crypto from 'crypto';

const uploadToCloudinaryServer = async (filePath, mimeType) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'fryxycyd';
  const apiKey = process.env.CLOUDINARY_API_KEY || '343131624618523';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'qiffBZDxa2s_U-We7ZlAnqW4mIU';
  const folder = 'aevora';
  const timestamp = Math.round(Date.now() / 1000);

  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.secure_url || data.url;
};

// Upload media file and save metadata
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // If request has JSON body with URL (e.g. uploaded directly to Cloudinary from client)
    if (!req.file && req.body && req.body.url) {
      const mediaData = {
        _id: 'media_' + Date.now(),
        filename: req.body.filename || 'cloudinary_image.jpg',
        url: req.body.url,
        mimeType: req.body.mimeType || 'image/jpeg',
        size: req.body.size || 0,
        altText: req.body.altText || 'Aevora Image',
        createdAt: new Date().toISOString()
      };

      localStore.saveMedia(mediaData);

      try {
        if (mongoose.connection.readyState === 1) {
          const media = new Media(mediaData);
          const newMedia = await media.save();
          return res.status(201).json(newMedia);
        }
      } catch (err) {}

      return res.status(201).json(mediaData);
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let finalFileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    
    // Upload to Cloudinary
    try {
      const cldUrl = await uploadToCloudinaryServer(req.file.path, req.file.mimetype);
      if (cldUrl) {
        finalFileUrl = cldUrl;
      }
    } catch (cldErr) {
      console.warn('Cloudinary server upload notice, fallback to local URL:', cldErr.message);
    }

    const mediaData = {
      _id: 'media_' + Date.now(),
      filename: req.file.filename,
      url: finalFileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      altText: req.body.altText || req.file.originalname,
      createdAt: new Date().toISOString()
    };

    localStore.saveMedia(mediaData);

    try {
      if (mongoose.connection.readyState === 1) {
        const media = new Media(mediaData);
        const newMedia = await media.save();
        return res.status(201).json(newMedia);
      }
    } catch (err) {
      console.warn('MongoDB media save notice:', err.message);
    }

    res.status(201).json(mediaData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  localStore.deleteMedia(id);

  try {
    if (mongoose.connection.readyState === 1) {
      await Media.findByIdAndDelete(id);
    }
  } catch (error) {
    console.warn('MongoDB media delete notice:', error.message);
  }

  res.json({ message: 'Media deleted' });
});

export default router;
