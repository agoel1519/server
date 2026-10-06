import mongoose from 'mongoose';

const TreatmentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'AESTHETIC CLINIC'
    },
    breadcrumb: {
      type: String,
      default: ''
    },
    introText: {
      type: String,
      default: ''
    },
    contentSection: {
      heading: { type: String, default: '' },
      text: { type: String, default: '' },
      image: { type: String, default: '' }
    },
    accordionSection: {
      heading: { type: String, default: '' },
      items: [
        {
          title: { type: String, default: '' },
          content: { type: String, default: '' }
        }
      ]
    },
    featuresSection: {
      heading: { type: String, default: '' },
      features: [
        {
          title: { type: String, default: '' },
          description: { type: String, default: '' }
        }
      ]
    },
    ctaSection: {
      heading: { type: String, default: '' },
      text: { type: String, default: '' }
    },
    beforeAfter: {
      heading: { type: String, default: 'CLINICAL TRANSFORMATIONS' },
      images: [
        {
          before: { type: String, default: '' },
          after: { type: String, default: '' }
        }
      ]
    },
    faqs: [
      {
        question: { type: String, default: '' },
        answer: { type: String, default: '' }
      }
    ],
    customSections: [
      {
        id: { type: String },
        type: { type: String, default: 'text' },
        heading: { type: String, default: '' },
        body: { type: String, default: '' },
        quote: { type: String, default: '' },
        author: { type: String, default: '' },
        steps: [
          {
            stepNumber: { type: String, default: '' },
            title: { type: String, default: '' },
            description: { type: String, default: '' }
          }
        ],
        stats: [
          {
            number: { type: String, default: '' },
            label: { type: String, default: '' }
          }
        ]
      }
    ],
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Treatment = mongoose.model('Treatment', TreatmentSchema);
export default Treatment;
