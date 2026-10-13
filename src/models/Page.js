import mongoose from 'mongoose';

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
