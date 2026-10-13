import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true }, // 'theme', 'navigation', 'general', 'footer'
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const Setting = mongoose.model('Setting', SettingSchema);
export default Setting;
