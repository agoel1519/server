import mongoose from 'mongoose';

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
